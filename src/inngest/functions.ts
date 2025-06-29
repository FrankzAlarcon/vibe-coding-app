import { openai, createAgent, createTool, createNetwork, Tool } from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from '@e2b/code-interpreter'
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { MessageRole, MessageType } from "@/generated/prisma";

interface CodeAgentState {
  summary: string
  files: { [path: string]: string }
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-coding-app-frankz")
      return sandbox.sandboxId
    })
    // Create a new agent with a system prompt (you can add optional tools, too)
    const codeAgent = createAgent<CodeAgentState>({
      name: "code-agent",
      system: PROMPT,
      description: "An expert coding Agent",
      model: openai({
        model: "gpt-4.1",
        // model: "gpt-4.1-mini",
        defaultParameters: {
          temperature: 0.1
        }
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string().describe("The command to run in the terminal")
          }),
          handler: async ({ command }) => {
            return await step.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" }
              try {
                const sandbox = await getSandbox(sandboxId)
                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffers.stdout += data
                  },
                  onStderr: (data) => {
                    buffers.stderr += data
                  }
                })
                return result.stdout
              } catch (error) {
                console.error(
                  `Command failed: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                )
                return `Command failed: ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
              }
            })
          }
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(z.object({
              path: z.string().describe("The path to the file"),
              content: z.string().describe("The content of the file")
            })).describe("The files to create or update")
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<CodeAgentState>
          ) => {
            // 
            const newFiles = await step?.run("createOrUpdateFiles", async () => {
              try {
                const updatedFiles = await network.state.data.files || {}
                const sandbox = await getSandbox(sandboxId)
                for (const file of files) {
                  await sandbox.files.write(file.path, file.content)
                  updatedFiles[file.path] = file.content
                }
                return updatedFiles
              } catch (error) {
                console.error(error)
                return "Error: " + error
              }
            })

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles
            }
          }
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()).describe("The files to read")
          }),
          handler: async (
            { files },
            { step }
          ) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId)
                const contents = []
                for (const file of files) {
                  const content = await sandbox.files.read(file)
                  contents.push({
                    path: file,
                    content
                  })
                }
                return JSON.stringify(contents)
              } catch (error) {
                console.error(error)
                return "Error: " + error
              }
            })
          }
        })
      ],
      lifecycle: {
        onResponse: async ({ result, network}) => {
          const lastAssistantTextMessage = lastAssistantTextMessageContent(result)
          if (lastAssistantTextMessage && network) {
            if (lastAssistantTextMessage.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }

          return result
        }
      }
    });

    const network = createNetwork<CodeAgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary
        if (summary) {
          return
        }
        return codeAgent
      }
    })

    const result = await network.run(event.data.value)

    const isError = !result.state.data.summary || Object.keys(result.state.data.files || {}).length === 0
    if (isError) {
      return await prisma.message.create({
        data: {
          content: "Something went wrong. Please try again.",
          role: MessageRole.ASSISTANT,
          type: MessageType.ERROR,
          projectId: event.data.projectId
        }
      })
    }
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId)
      const host = sandbox.getHost(3000)
      return `https://${host}`
    })

    await step.run("save-result", async () => {
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          fragment: {
            create: {
              sandboxUrl,
              title: "Fragment",
              files: result.state.data.files
            }
          }
        }
      })
    })

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary
    };
  },
);
