import { Elysia, status, t } from "elysia";
import { and, desc, eq, lt, or } from "drizzle-orm";
import { comments, users } from "@/server/db/schema";
import { authPlugin } from "../context";

export const guestbookRouter = new Elysia({ prefix: "/guestbook" })
  .use(authPlugin)
  .get(
    "/",
    async ({ db, query }) => {
      const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 10;
      const cursor = query.cursor;

      const filters = [];

      if (cursor) {
        const cursorComment = await db
          .select({
            id: comments.id,
            createdAt: comments.createdAt,
          })
          .from(comments)
          .where(eq(comments.id, cursor))
          .limit(1)
          .then((res) => res[0]);

        if (cursorComment) {
          const { createdAt: cCreatedAt, id: cId } = cursorComment;
          filters.push(
            or(
              lt(comments.createdAt, cCreatedAt),
              and(eq(comments.createdAt, cCreatedAt), lt(comments.id, cId)),
            ),
          );
        }
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
        .orderBy(desc(comments.createdAt), desc(comments.id))
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
      }),
    },
  )
  .post(
    "/",
    async ({ db, user, body }) => {
      const { content } = body;

      const res: {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      } = await (
        await fetch("https://vector.profanity.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })
      ).json();

      if (res.isProfanity) {
        return status(400, { message: "Message contains profanity!" });
      }

      const [comment] = await db
        .insert(comments)
        .values({
          content,
          userId: user!.id,
        })
        .returning();

      return comment;
    },
    {
      isAuth: true,
      body: t.Object({
        content: t.String({ minLength: 1 }),
      }),
    },
  )
  .put(
    "/:id",
    async ({ db, user, params, body }) => {
      const { id } = params;
      const { content } = body;

      const res: {
        isProfanity: boolean;
        score: number;
        flaggedFor?: string[];
      } = await (
        await fetch("https://vector.profanity.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        })
      ).json();

      if (res.isProfanity) {
        return status(400, { message: "Message contains profanity!" });
      }

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!comment) {
        return status(404, { message: "Comment not found" });
      }

      if (comment.userId !== user!.id) {
        return status(403, { message: "Forbidden: You are not the author of this comment" });
      }

      const [updatedComment] = await db
        .update(comments)
        .set({ content })
        .where(eq(comments.id, id))
        .returning();

      return updatedComment;
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        content: t.String({ minLength: 1 }),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ db, user, params }) => {
      const { id } = params;

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id))
        .limit(1)
        .then((rows) => rows[0]);

      if (!comment) {
        return status(404, { message: "Comment not found" });
      }

      if (comment.userId !== user!.id) {
        return status(403, { message: "Forbidden: You are not the author of this comment" });
      }

      await db.delete(comments).where(eq(comments.id, id));

      return { success: true };
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
    },
  );
