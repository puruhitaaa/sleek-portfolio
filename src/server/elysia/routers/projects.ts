import { Elysia, status, t } from "elysia";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm";
import { createHash } from "crypto";
import { projects } from "@/server/db/schema";
import { env } from "@/env";
import { syncProjectWithOutbox } from "@/server/cv-site-sync";
import { authPlugin } from "../context";

interface CloudinaryDeleteResponse {
  result: string;
}

export const projectsRouter = new Elysia({ prefix: "/projects" })
  .use(authPlugin)
  .get(
    "/",
    async ({ db, query }) => {
      const limit = query.limit ? Math.min(Math.max(Number(query.limit), 1), 100) : 10;
      const { cursor, sort = "newest" } = query;

      const filters = [];

      if (cursor) {
        const cursorProject = await db
          .select({
            id: projects.id,
            createdAt: projects.createdAt,
            isPinned: projects.isPinned,
          })
          .from(projects)
          .where(eq(projects.id, cursor))
          .limit(1)
          .then((res) => res[0]);

        if (cursorProject) {
          const {
            createdAt: cCreatedAt,
            isPinned: cPinned,
            id: cId,
          } = cursorProject;

          if (sort === "oldest") {
            const cursorCondition = cPinned
              ? or(
                  and(
                    eq(projects.isPinned, true),
                    or(
                      gt(projects.createdAt, cCreatedAt),
                      and(
                        eq(projects.createdAt, cCreatedAt),
                        gt(projects.id, cId),
                      ),
                    ),
                  ),
                  eq(projects.isPinned, false),
                )
              : and(
                  eq(projects.isPinned, false),
                  or(
                    gt(projects.createdAt, cCreatedAt),
                    and(
                      eq(projects.createdAt, cCreatedAt),
                      gt(projects.id, cId),
                    ),
                  ),
                );
            filters.push(cursorCondition);
          } else {
            const cursorCondition = cPinned
              ? or(
                  and(
                    eq(projects.isPinned, true),
                    or(
                      lt(projects.createdAt, cCreatedAt),
                      and(
                        eq(projects.createdAt, cCreatedAt),
                        lt(projects.id, cId),
                      ),
                    ),
                  ),
                  eq(projects.isPinned, false),
                )
              : and(
                  eq(projects.isPinned, false),
                  or(
                    lt(projects.createdAt, cCreatedAt),
                    and(
                      eq(projects.createdAt, cCreatedAt),
                      lt(projects.id, cId),
                    ),
                  ),
                );
            filters.push(cursorCondition);
          }
        }
      }

      const sortOrder =
        sort === "oldest"
          ? [desc(projects.isPinned), asc(projects.createdAt), asc(projects.id)]
          : [desc(projects.isPinned), desc(projects.createdAt), desc(projects.id)];

      const items = await db
        .select()
        .from(projects)
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
  .post(
    "/",
    async ({ db, body }) => {
      const [project] = await db
        .insert(projects)
        .values({
          ...body,
          isPublished: true,
        })
        .returning();

      if (project) {
        await syncProjectWithOutbox("upsert", project);
      }

      return project;
    },
    {
      isAdmin: true,
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.String({ minLength: 1 }),
        image: t.String({ format: "uri" }),
        websiteLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
        githubLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
        youtubeLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
      }),
    },
  )
  .put(
    "/:id",
    async ({ db, params, body }) => {
      const { id } = params;
      const { imageUrl: _imageUrl, ...updateData } = body;

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      if (!updatedProject) {
        return status(404, { message: "Project not found" });
      }

      await syncProjectWithOutbox("upsert", updatedProject);

      return updatedProject;
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        description: t.String({ minLength: 1 }),
        image: t.String({ format: "uri" }),
        imageUrl: t.Optional(t.String({ format: "uri" })),
        websiteLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
        githubLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
        youtubeLink: t.Optional(t.Nullable(t.String({ format: "uri" }))),
      }),
    },
  )
  .patch(
    "/:id/pin",
    async ({ db, params }) => {
      const { id } = params;

      const project = await db
        .select({ isPinned: projects.isPinned })
        .from(projects)
        .where(eq(projects.id, id))
        .then((res) => res[0]);

      if (!project) {
        return status(404, { message: "Project not found" });
      }

      const [updatedProject] = await db
        .update(projects)
        .set({
          isPinned: !project.isPinned,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      if (updatedProject) {
        await syncProjectWithOutbox("upsert", updatedProject);
      }

      return updatedProject;
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
    async ({ db, params, body }) => {
      const { id } = params;
      const { imageUrl } = body;

      const timestamp = Date.now().toString();
      const imageId =
        "projects/" + imageUrl.split("/").pop()!.split(".")[0]!;

      const signatureString = `public_id=${imageId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", imageId);
      formData.append("signature", signature);
      formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);

      const [deletedProject] = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();

      if (!deletedProject) {
        return status(404, { message: "Project not found" });
      }

      await syncProjectWithOutbox("delete", id);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          },
        );
        const result = (await response.json()) as CloudinaryDeleteResponse;

        if (result.result !== "ok") {
          console.error(
            `Cloudinary cleanup failed after deleting project ${id}: ${result.result}`,
          );
        }
      } catch (err: unknown) {
        console.error(
          `Cloudinary cleanup failed after deleting project ${id}:`,
          err,
        );
      }

      return { success: true };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        imageUrl: t.String(),
      }),
    },
  );
