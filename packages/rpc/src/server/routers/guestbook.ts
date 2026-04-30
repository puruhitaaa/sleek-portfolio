import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { and, comments, desc, eq, lt, users } from "@baiqueee/db";

import { privateProcedure, publicProcedure } from "../orpc";
// import ratelimit from "@/lib/redis/ratelimit";

export const guestbookRouter = {
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const { db } = context;
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
    .handler(async ({ context, input }) => {
      const { session } = context;
      // const { success } = await ratelimit.limit(userId!);

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = context;
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
        throw new ORPCError("BAD_REQUEST", {
          message: "Message contains profanity!",
        });
      }

      const [comment] = await db
        .insert(comments)
        .values({
          content,
          userId: session?.user.id!,
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
    .handler(async ({ context, input }) => {
      const { session } = context;

      // const { success } = await ratelimit.limit(session?.session.userId.toString()!)

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = context;
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
        throw new ORPCError("BAD_REQUEST", {
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
        throw new ORPCError("NOT_FOUND", {
          message: "Comment not found",
        });
      }

      if (comment.userId !== session?.user.id) {
        throw new ORPCError("UNAUTHORIZED", {
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
    .handler(async ({ context, input }) => {
      const { session } = context;

      // const { success } = await ratelimit.limit(session?.session.userId.toString()!)

      // if (!success) {
      //   throw new TRPCError({
      //     code: "TOO_MANY_REQUESTS",
      //     message: "Rate limit exceeded",
      //   });
      // }

      const { db } = context;
      const { id } = input;

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!comment) {
        throw new ORPCError("NOT_FOUND", {
          message: "Comment not found",
        });
      }

      if (comment.userId !== session?.user.id) {
        throw new ORPCError("UNAUTHORIZED", {
          message: "Unauthorized",
        });
      }

      await db.delete(comments).where(eq(comments.id, id));

      return { success: true };
    }),
} as const;
