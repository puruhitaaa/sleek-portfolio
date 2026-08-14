import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { logs } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

const logSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
});

const updateLogSchema = logSchema.extend({
  id: z.string(),
});

const deleteLogSchema = updateLogSchema.pick({ id: true });

export const logsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(6),
        cursor: z.string().optional(),
        category: z.string().optional(),
        published: z.enum(["all", "published"]).default("published").optional(),
        sort: z.enum(["newest", "oldest"]).default("newest").optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, cursor, category, published, sort = "newest" } = input;

      const filters = [];

      if (category && category !== "all") {
        filters.push(eq(logs.category, category));
      }

      if (published !== "all") {
        filters.push(eq(logs.isPublished, true));
      }

      if (cursor) {
        const cursorLog = await db
          .select({
            id: logs.id,
            createdAt: logs.createdAt,
          })
          .from(logs)
          .where(eq(logs.id, cursor))
          .limit(1)
          .then((res) => res[0]);

        if (cursorLog) {
          const { createdAt: cCreatedAt, id: cId } = cursorLog;

          if (sort === "oldest") {
            filters.push(
              or(
                gt(logs.createdAt, cCreatedAt),
                and(eq(logs.createdAt, cCreatedAt), gt(logs.id, cId)),
              ),
            );
          } else {
            filters.push(
              or(
                lt(logs.createdAt, cCreatedAt),
                and(eq(logs.createdAt, cCreatedAt), lt(logs.id, cId)),
              ),
            );
          }
        }
      }

      const sortOrder =
        sort === "oldest"
          ? [asc(logs.createdAt), asc(logs.id)]
          : [desc(logs.createdAt), desc(logs.id)];

      const items = await db
        .select()
        .from(logs)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(...sortOrder)
        .limit(limit + 1);

      let nextCursor: typeof cursor = undefined;
      if (items.length > limit) {
        items.pop();
        const lastItem = items[items.length - 1];
        nextCursor = lastItem?.id;
      }

      return { items, nextCursor };
    }),
  create: adminProcedure.input(logSchema).mutation(async ({ ctx, input }) => {
    const { db } = ctx;
    const [log] = await db
      .insert(logs)

      .values({
        title: input.title,
        content: input.content,
        category: input.category,
        isPublished: true,
      })
      .returning();

    return log;
  }),
  update: adminProcedure
    .input(updateLogSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...updateData } = input;

      const existingLog = await db.select().from(logs).where(eq(logs.id, id));

      if (!existingLog) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Log not found" });
      }

      const [updatedLog] = await db
        .update(logs)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(logs.id, id))
        .returning();

      return updatedLog;
    }),
  delete: adminProcedure
    .input(deleteLogSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      await db.delete(logs).where(eq(logs.id, id));

      return { success: true };
    }),
});
