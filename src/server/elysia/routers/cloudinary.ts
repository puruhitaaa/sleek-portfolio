import { Elysia, status, t } from "elysia";
import { createHash } from "crypto";
import { env } from "@/env";
import { authPlugin } from "../context";

interface CloudinaryDeleteResponse {
  result: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export const cloudinaryRouter = new Elysia({ prefix: "/cloudinary" })
  .use(authPlugin)
  .post(
    "/upload",
    async ({ body }) => {
      const timestamp = Date.now().toString();

      const params: Record<string, string> = {
        timestamp,
        folder: body.folder,
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
      formData.append("file", body.image);
      formData.append("folder", body.folder);
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
          return status(500, {
            message: `Cloudinary upload failed: ${JSON.stringify(data)}`,
          });
        }

        return data;
      } catch (err) {
        console.error("Error uploading image:", err);
        return status(500, { message: "Failed to upload image to Cloudinary" });
      }
    },
    {
      isAdmin: true,
      body: t.Object({
        image: t.String({ minLength: 1 }),
        folder: t.String({ minLength: 1 }),
      }),
    },
  )
  .post(
    "/delete",
    async ({ body }) => {
      const timestamp = Date.now().toString();

      const signatureString = `public_id=${body.publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
      const signature = createHash("sha1")
        .update(signatureString)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", body.publicId);
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
          return status(500, {
            message: `Cloudinary deletion failed: ${JSON.stringify(data)}`,
          });
        }

        if (data.result !== "ok") {
          return status(500, {
            message: "Image deletion was not successful",
          });
        }

        return { success: true };
      } catch (err) {
        console.error("Error deleting image:", err);
        return status(500, { message: "Failed to delete image from Cloudinary" });
      }
    },
    {
      isAdmin: true,
      body: t.Object({
        publicId: t.String({ minLength: 1 }),
      }),
    },
  );
