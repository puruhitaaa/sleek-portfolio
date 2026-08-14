import { Elysia, status, t } from "elysia";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { posts } from "@/server/db/schema";
import { authPlugin } from "../context";

export const postsRouter = new Elysia({ prefix: "/posts" })
  .use(authPlugin)
  .get(
    "/",
    async ({ db, query }) => {
      const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 10;
      const { cursor, sort = "newest" } = query;

      const filters = [];

      if (cursor) {
        const cursorPost = await db
          .select({
            id: posts.id,
            createdAt: posts.createdAt,
            isPinned: posts.isPinned,
          })
          .from(posts)
          .where(eq(posts.id, cursor))
          .limit(1)
          .then((res) => res[0]);

        if (cursorPost) {
          const {
            createdAt: cCreatedAt,
            isPinned: cPinned,
            id: cId,
          } = cursorPost;

          if (sort === "oldest") {
            const cursorCondition = cPinned
              ? or(
                  and(
                    eq(posts.isPinned, true),
                    or(
                      gt(posts.createdAt, cCreatedAt),
                      and(
                        eq(posts.createdAt, cCreatedAt),
                        gt(posts.id, cId),
                      ),
                    ),
                  ),
                  eq(posts.isPinned, false),
                )
              : and(
                  eq(posts.isPinned, false),
                  or(
                    gt(posts.createdAt, cCreatedAt),
                    and(
                      eq(posts.createdAt, cCreatedAt),
                      gt(posts.id, cId),
                    ),
                  ),
                );
            filters.push(cursorCondition);
          } else {
            const cursorCondition = cPinned
              ? or(
                  and(
                    eq(posts.isPinned, true),
                    or(
                      lt(posts.createdAt, cCreatedAt),
                      and(
                        eq(posts.createdAt, cCreatedAt),
                        lt(posts.id, cId),
                      ),
                    ),
                  ),
                  eq(posts.isPinned, false),
                )
              : and(
                  eq(posts.isPinned, false),
                  or(
                    lt(posts.createdAt, cCreatedAt),
                    and(
                      eq(posts.createdAt, cCreatedAt),
                      lt(posts.id, cId),
                    ),
                  ),
                );
            filters.push(cursorCondition);
          }
        }
      }

      const sortOrder =
        sort === "oldest"
          ? [desc(posts.isPinned), asc(posts.createdAt), asc(posts.id)]
          : [desc(posts.isPinned), desc(posts.createdAt), desc(posts.id)];

      const items = await db
        .select()
        .from(posts)
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
        limit: t.Optional(t.Numeric({ default: 10, minimum: 1, maximum: 100 })),
        cursor: t.Optional(t.String()),
        sort: t.Optional(t.Union([t.Literal("newest"), t.Literal("oldest")], { default: "newest" })),
      }),
    },
  )
  .get(
    "/:id",
    async ({ db, params }) => {
      const { id } = params;

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)
        .then((res) => res[0]);

      if (!post) {
        return status(404, { message: "Post not found" });
      }

      return post;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/",
    async ({ db, body }) => {
      const [post] = await db
        .insert(posts)
        .values({
          title: body.title,
          content: body.content,
          isPublished: true,
        })
        .returning();

      return post;
    },
    {
      isAdmin: true,
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
      }),
    },
  )
  .put(
    "/:id",
    async ({ db, params, body }) => {
      const { id } = params;

      const existingPost = await db
        .select()
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1)
        .then((res) => res[0]);

      if (!existingPost) {
        return status(404, { message: "Post not found" });
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, id))
        .returning();

      return updatedPost;
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
      }),
    },
  )
  .patch(
    "/:id/pin",
    async ({ db, params }) => {
      const { id } = params;

      const post = await db
        .select({ isPinned: posts.isPinned })
        .from(posts)
        .where(eq(posts.id, id))
        .then((res) => res[0]);

      if (!post) {
        return status(404, { message: "Post not found" });
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
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ db, params }) => {
      const { id } = params;

      const [deletedPost] = await db
        .delete(posts)
        .where(eq(posts.id, id))
        .returning();

      if (!deletedPost) {
        return status(404, { message: "Post not found" });
      }

      return { success: true };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  );
