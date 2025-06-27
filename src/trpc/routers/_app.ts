import { inngest } from "@/inngest/client";
import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";

export const appRouter = createTRPCRouter({
    invoke: baseProcedure.input(
        z.object({
            text: z.string()
        })
    ).mutation(async ({ input }) => {
        await inngest.send({
            name: "test/hello.world",
            data: {
                email: input.text
            }
        })
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

