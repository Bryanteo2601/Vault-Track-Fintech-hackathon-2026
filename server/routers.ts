import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { chatWithAI } from "./ai-service";
import type { AppData } from "@/lib/types";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          message: z.string(),
          portfolioData: z.any() as z.ZodType<AppData>,
          conversationHistory: z.array(
            z.object({
              role: z.string(),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await chatWithAI(
            input.message,
            input.portfolioData,
            input.conversationHistory
          );
          return { success: true, response };
        } catch (error) {
          console.error("AI chat error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get AI response",
          };
        }
      }),
  })
});

export type AppRouter = typeof appRouter;
