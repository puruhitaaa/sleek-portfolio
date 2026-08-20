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
        name: siteConfig.name,
        role: siteConfig.role,
        avatar: "/assets/images/home-pic.webp",
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

      const existing = await db
        .select()
        .from(bio)
        .where(eq(bio.id, "default"))
        .limit(1)
        .then((res) => res[0]);

      const valuesToInsert = {
        id: "default",
        name: body.name ?? existing?.name ?? siteConfig.name,
        role: body.role ?? existing?.role ?? siteConfig.role,
        avatar: body.avatar ?? existing?.avatar ?? "/assets/images/home-pic.webp",
        greeting: body.greeting ?? existing?.greeting ?? siteConfig.bio.greeting,
        content: body.content ?? existing?.content ?? DEFAULT_BIO_CONTENT,
        updatedAt: new Date(),
      };

      const [updated] = await db
        .insert(bio)
        .values(valuesToInsert)
        .onConflictDoUpdate({
          target: bio.id,
          set: {
            name: valuesToInsert.name,
            role: valuesToInsert.role,
            avatar: valuesToInsert.avatar,
            greeting: valuesToInsert.greeting,
            content: valuesToInsert.content,
            updatedAt: new Date(),
          },
        })
        .returning();

      return updated;
    },
    {
      isAuth: true,
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        role: t.Optional(t.String({ minLength: 1 })),
        avatar: t.Optional(t.String({ minLength: 1 })),
        greeting: t.Optional(t.String({ minLength: 1 })),
        content: t.Optional(t.String({ minLength: 1 })),
      }),
    },
  );
