import { ORPCError } from "@orpc/server";
import { z } from "zod";

import { and, asc, desc, eq, lt, posts } from "@baiqueee/db";
import { adminProcedure, publicProcedure } from "../orpc";

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

const updatePostSchema = postSchema.extend({
  id: z.string(),
});

const deletePostSchema = updatePostSchema.pick({ id: true });

export const postRouter = {
  togglePin: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id } = input;

      const post = await db
        .select({ isPinned: posts.isPinned })
        .from(posts)
        .where(eq(posts.id, id))
        .then((res) => res[0]);

      if (!post) {
        throw new ORPCError("NOT_FOUND", {
          message: "Post not found",
        });
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          isPinned: !post.isPinned,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      return updatedPost;
    }),
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        sort: z.enum(["newest", "oldest"]).default("newest").optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { limit, cursor, sort } = input;

      const filters = [];

      if (cursor) {
        filters.push(lt(posts.id, cursor));
      }

      const sortOrder = (() => {
        switch (sort) {
          case "oldest":
            return [desc(posts.isPinned), asc(posts.createdAt)];
          case "newest":
          default:
            return [desc(posts.isPinned), desc(posts.createdAt)];
        }
      })();

      const items = await db
        .select()
        .from(posts)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(...sortOrder)
        .limit(limit + 1);

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return { items, nextCursor };
    }),
  create: adminProcedure.input(postSchema).handler(async ({ context, input }) => {
    const { db } = context;
    const [post] = await db
      .insert(posts)
      .values({
        title: input.title,
        content: input.content,
        isPublished: true,
      })
      .returning();

    return post;
  }),
  update: adminProcedure
    .input(updatePostSchema)
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id, ...updateData } = input;

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      return updatedPost;
    }),
  delete: adminProcedure
    .input(deletePostSchema)
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id } = input;

      await db.delete(posts).where(eq(posts.id, id));

      return { success: true };
    }),
  detail: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id } = input;

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)
        .then((res) => res[0]);

      if (!post) {
        throw new ORPCError("NOT_FOUND", {
          message: "Post not found",
        });
      }

      return post;
    }),
} as const;
