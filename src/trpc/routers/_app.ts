import { baseProcedure, createTRPCRouter } from "../init";
import { z } from "zod";

export const appRouter = createTRPCRouter({
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

