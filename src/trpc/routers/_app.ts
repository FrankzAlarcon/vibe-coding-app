import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";

export const appRouter = createTRPCRouter({
    invoke: baseProcedure.input(
        z.object({
            text: z.string()
        })
    ).mutation(async ({ input }) => {
        try {
            await inngest.send({
                name: "test/hello.world",
                data: {
                    text: input.text  // Use consistent field naming
                }
            });
            return { success: true, message: "Event sent successfully" };
        } catch (error) {
            throw new Error("Failed to send event");
        }
    }),
    createAI: baseProcedure
    .input(
        z.object({
            text: z.string()
        })
    ).query((opts) => {
        return {
            greeting: `Hello ${opts.input.text}`
        }
    })
})

export type AppRouter = typeof appRouter

