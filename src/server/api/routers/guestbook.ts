import { comments, users } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure, privateProcedure } from "../trpc";
import { z } from "zod";
import { lt, and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
// import ratelimit from "@/lib/redis/ratelimit";

export const guestbookRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, cursor } = input;

      const filters = [];

      if (cursor) {
        filters.push(lt(comments.id, cursor));
      }

      const items = await db
        .select({
          id: comments.id,
          content: comments.content,
          createdAt: comments.createdAt,
          user: {
            id: users.id,
            name: users.name,
            image: users.image,
          },
        })
        .from(comments)
        .leftJoin(users, eq(comments.userId, users.id))
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(desc(comments.createdAt))
        .limit(limit + 1);

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),

  create: privateProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const userId = session?.session.userId.toString();

      // const { success } = await ratelimit.limit(userId!);

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = ctx;
      const { content } = input;

      const res: {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      } = (await (
        await fetch("https://vector.profanity.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })
      ).json()) as {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      };

      if (res.isProfanity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Message contains profanity!",
        });
      }

      const [comment] = await db
        .insert(comments)
        .values({
          content,
          userId: userId!,
        })
        .returning();

      return comment;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // const { success } = await ratelimit.limit(session?.session.userId.toString()!)

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = ctx;
      const { id, content } = input;

      const res: {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      } = (await (
        await fetch("https://vector.profanity.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })
      ).json()) as {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      };

      if (res.isProfanity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Message contains profanity!",
        });
      }

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== session?.session.userId.toString()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const [updatedComment] = await db
        .update(comments)
        .set({ content })
        .where(eq(comments.id, id))
        .returning();

      return updatedComment;
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // const { success } = await ratelimit.limit(session?.session.userId.toString()!)

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = ctx;
      const { id } = input;

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (comment.userId !== session?.session.userId.toString()) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      await db.delete(comments).where(eq(comments.id, id));

      return { success: true };
    }),
});
