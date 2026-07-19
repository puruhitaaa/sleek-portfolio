import { z } from "zod";
import { createHash } from "crypto";
import { ORPCError } from "@orpc/server";

import { and, asc, desc, eq, lt, projects } from "@baiqueee/db";
import { apiEnv } from "@baiqueee/env/api";
import { syncProjectToCvSite } from "../lib/cv-site-sync";
import { adminProcedure, publicProcedure } from "../orpc";

interface CloudinaryDeleteResponse {
  result: string;
}

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  websiteLink: z.string().url().optional().nullable(),
  githubLink: z.string().url().optional().nullable(),
  youtubeLink: z.string().url().optional().nullable(),
});

const updateProjectSchema = projectSchema.extend({
  id: z.string(),
  imageUrl: z.string().url(),
});

const deleteProjectSchema = updateProjectSchema.pick({
  id: true,
  imageUrl: true,
});

export const projectRouter = {
  togglePin: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id } = input;

      const project = await db
        .select({ isPinned: projects.isPinned })
        .from(projects)
        .where(eq(projects.id, id))
        .then((res) => res[0]);

      if (!project) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
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
        await syncProjectToCvSite("upsert", updatedProject);
      }

      return updatedProject;
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
        filters.push(lt(projects.id, cursor));
      }

      const sortOrder = (() => {
        switch (sort) {
          case "oldest":
            return [desc(projects.isPinned), asc(projects.createdAt)];
          case "newest":
          default:
            return [desc(projects.isPinned), desc(projects.createdAt)];
        }
      })();

      const items = await db
        .select()
        .from(projects)
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
  create: adminProcedure
    .input(projectSchema)
    .handler(async ({ context, input }) => {
      const { db } = context;
      const [project] = await db
        .insert(projects)
        .values({
          ...input,
          isPublished: true,
        })
        .returning();

      if (project) {
        await syncProjectToCvSite("upsert", project);
      }

      return project;
    }),
  update: adminProcedure
    .input(updateProjectSchema)
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id, ...updateData } = input;

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      if (updatedProject) {
        await syncProjectToCvSite("upsert", updatedProject);
      }

      return updatedProject;
    }),
  delete: adminProcedure
    .input(deleteProjectSchema)
    .handler(async ({ context, input }) => {
      const { db } = context;
      const { id } = input;

      const deleted = await db
        .delete(projects)
        .where(eq(projects.id, id))
        .returning();

      if (!deleted[0]) {
        throw new ORPCError("NOT_FOUND", {
          message: "Project not found",
        });
      }

      // Always sync after DB delete so cv-site never keeps orphans
      await syncProjectToCvSite("delete", id);

      const timestamp = Date.now().toString();
      const imageId =
        "projects/" + input.imageUrl.split("/").pop()!.split(".")[0]!;

      const signatureString = `public_id=${imageId}&timestamp=${timestamp}${apiEnv.CLOUDINARY_API_SECRET}`;
      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", imageId);
      formData.append("signature", signature);
      formData.append("api_key", apiEnv.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);

      try {
        const data = await fetch(
          `https://api.cloudinary.com/v1_1/${apiEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          },
        );

        const delRes = (await data.json()) as CloudinaryDeleteResponse;

        if (delRes.result !== "ok") {
          console.error(
            `Cloudinary deletion failed after DB delete for project ${id}: ${JSON.stringify(delRes)}`,
          );
        }
      } catch (error: unknown) {
        console.error(
          `Cloudinary cleanup failed after DB delete for project ${id}:`,
          error,
        );
      }

      return { success: true };
    }),
} as const;
