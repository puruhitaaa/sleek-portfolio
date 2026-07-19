import { z } from "zod";

const apiEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_LASTFM_API_KEY: z.string().min(1),
  NEXT_PUBLIC_LASTFM_USERNAME: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  CV_SITE_SYNC_URL: z.string().url().optional(),
  CV_SITE_SYNC_SECRET: z.string().min(1).optional(),
});

export const apiEnv = apiEnvSchema.parse(process.env);

export type ApiEnv = z.infer<typeof apiEnvSchema>;
