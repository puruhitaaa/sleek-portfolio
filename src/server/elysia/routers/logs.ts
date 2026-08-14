import { Elysia, status, t } from "elysia";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { logs } from "@/server/db/schema";
import { authPlugin } from "../context";

export const logsRouter = new Elysia({ prefix: "/logs" })
  .use(authPlugin)
  .get(
    "/",
    async ({ db, query }) => {
      const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 6;
      const { cursor, category, published = "published", sort = "newest" } = query;

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

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        items.pop();
        const lastItem = items[items.length - 1];
        nextCursor = lastItem?.id;
      }

      return { items, nextCursor };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric({ default: 6, minimum: 1, maximum: 100 })),
        cursor: t.Optional(t.String()),
        category: t.Optional(t.String()),
        published: t.Optional(t.Union([t.Literal("all"), t.Literal("published")], { default: "published" })),
        sort: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")], { default: "newest" })),
      }),
    },
  )
  .post(
    "/",
    async ({ db, body }) => {
      const [log] = await db
        .insert(logs)
        .values({
          title: body.title,
          content: body.content,
          category: body.category,
          isPublished: true,
        })
        .returning();

      return log;
    },
    {
      isAdmin: true,
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
        category: t.String({ minLength: 1 }),
      }),
    },
  )
  .put(
    "/:id",
    async ({ db, params, body }) => {
      const { id } = params;

      const existingLog = await db.select().from(logs).where(eq(logs.id, id)).limit(1).then((rows) => rows[0]);

      if (!existingLog) {
        return status(404, { message: "Log not found" });
      }

      const [updatedLog] = await db
        .update(logs)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(logs.id, id))
        .returning();

      return updatedLog;
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
        category: t.String({ minLength: 1 }),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ db, params }) => {
      const { id } = params;
      await db.delete(logs).where(eq(logs.id, id));
      return { success: true };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  );
