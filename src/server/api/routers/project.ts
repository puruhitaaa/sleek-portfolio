import { and, asc, desc, eq, lt } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure } from "../trpc";
import { z } from "zod";
import { projects } from "@/server/db/schema";
import { env } from "@/env";
import { createHash } from "crypto";
import { TRPCError } from "@trpc/server";

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

export const projectRouter = createTRPCRouter({
  togglePin: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      const project = await db
        .select({ isPinned: projects.isPinned })
        .from(projects)
        .where(eq(projects.id, id))
        .then((res) => res[0]);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
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
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
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
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const [project] = await db.insert(projects).values(input).returning();

      return project;
    }),
  update: adminProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...updateData } = input;

      const [updatedProject] = await db
        .update(projects)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, id))
        .returning();

      return updatedProject;
    }),
  delete: adminProcedure
    .input(deleteProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      const timestamp = Date.now().toString();
      const imageId =
        "projects/" + input.imageUrl.split("/").pop()!.split(".")[0]!;

      const signatureString = `public_id=${imageId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", imageId);
      formData.append("signature", signature);
      formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);

      try {
        const deleteProject = db
          .delete(projects)
          .where(eq(projects.id, id))
          .returning();
        const deleteImage = fetch(
          `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          },
        );

        const [response, data] = await Promise.all([
          deleteProject,
          deleteImage,
        ]);

        const delRes = (await data.json()) as CloudinaryDeleteResponse;

        if (delRes.result !== "ok") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Cloudinary deletion failed: ${JSON.stringify(data)}`,
          });
        }

        if (!response) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete project",
          });
        }

        return { success: true };
      } catch (error: unknown) {
        console.error("Error deleting image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image from Cloudinary",
        });
      }
    }),
});
