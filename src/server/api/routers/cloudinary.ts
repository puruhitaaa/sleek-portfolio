import { createHash } from "crypto";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

interface CloudinaryDeleteResponse {
  result: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export const cloudinaryRouter = createTRPCRouter({
  uploadImage: adminProcedure
    .input(z.object({ image: z.string(), folder: z.string() }))
    .mutation(async ({ input }) => {
      const timestamp = Date.now().toString();

      const params: Record<string, string> = {
        timestamp,
        folder: input.folder,
      };

      const signatureString =
        Object.keys(params)
          .sort()
          .map((key) => `${key}=${params[key]}`)
          .join("&") + env.CLOUDINARY_API_SECRET;

      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("file", input.image);
      formData.append("folder", input.folder);
      formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
          },
        );

        const data = (await response.json()) as CloudinaryUploadResponse;

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Cloudinary upload failed: ${JSON.stringify(data)}`,
          });
        }

        return data;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image to Cloudinary",
        });
      }
    }),

  deleteImage: adminProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const timestamp = Date.now().toString();

      const signatureString = `public_id=${input.publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", input.publicId);
      formData.append("signature", signature);
      formData.append("api_key", env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      formData.append("timestamp", timestamp);

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

        const data = (await response.json()) as CloudinaryDeleteResponse;

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Cloudinary deletion failed: ${JSON.stringify(data)}`,
          });
        }

        if (data.result !== "ok") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Image deletion was not successful",
          });
        }

        return { success: true };
      } catch (error) {
        console.error("Error deleting image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image from Cloudinary",
        });
      }
    }),
});
