import { Elysia, status, t } from "elysia";
import { eq } from "drizzle-orm";
import { bio } from "@/server/db/schema";
import { authPlugin } from "../context";
import { siteConfig } from "@/site";

const DEFAULT_BIO_CONTENT = siteConfig.bio.paragraphs
  .map((paragraph) => `<p>${paragraph}</p>`)
  .join("");

export const bioRouter = new Elysia({ prefix: "/bio" })
  .use(authPlugin)
  .get("/", async ({ db }) => {
    const existing = await db
      .select()
      .from(bio)
      .where(eq(bio.id, "default"))
      .limit(1)
      .then((res) => res[0]);

    if (!existing) {
      return {
        id: "default",
        greeting: siteConfig.bio.greeting,
        content: DEFAULT_BIO_CONTENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return existing;
  })
  .put(
    "/",
    async ({ db, user, body }) => {
      if (!user || user.role !== "admin" || user.email !== "hughdev101@gmail.com") {
        return status(403, {
          message: "Forbidden: Only hughdev101@gmail.com is authorized to modify this content",
        });
      }

      const [updated] = await db
        .insert(bio)
        .values({
          id: "default",
          greeting: body.greeting,
          content: body.content,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: bio.id,
          set: {
            greeting: body.greeting,
            content: body.content,
            updatedAt: new Date(),
          },
        })
        .returning();

      return updated;
    },
    {
      isAuth: true,
      body: t.Object({
        greeting: t.String({ minLength: 1 }),
        content: t.String({ minLength: 1 }),
      }),
    },
  );
