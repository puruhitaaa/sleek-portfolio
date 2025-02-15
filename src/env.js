import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CLOUDINARY_API_SECRET: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    // UPSTASH_REDIS_REST_TOKEN: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
    // NEXT_PUBLIC_UPSTASH_REDIS_REST_URL: z.string(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
    NEXT_PUBLIC_LASTFM_API_KEY: z.string(),
    NEXT_PUBLIC_LASTFM_USERNAME: z.string(),
    NEXT_PUBLIC_FRONTEND_API_URL_DEVELOPMENT: z.string().url(),
    NEXT_PUBLIC_FRONTEND_API_URL_PRODUCTION: z.string().url(),
    NEXT_PUBLIC_BETTER_AUTH_URL_DEVELOPMENT: z.string().url(),
    NEXT_PUBLIC_BETTER_AUTH_URL_PRODUCTION: z.string().url(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_FRONTEND_API_URL_DEVELOPMENT:
      process.env.NEXT_PUBLIC_FRONTEND_API_URL_DEVELOPMENT,
    NEXT_PUBLIC_FRONTEND_API_URL_PRODUCTION:
      process.env.NEXT_PUBLIC_FRONTEND_API_URL_PRODUCTION,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    // NEXT_PUBLIC_UPSTASH_REDIS_REST_URL:
    //   process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
    // UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_LASTFM_API_KEY: process.env.NEXT_PUBLIC_LASTFM_API_KEY,
    NEXT_PUBLIC_LASTFM_USERNAME: process.env.NEXT_PUBLIC_LASTFM_USERNAME,
    NEXT_PUBLIC_BETTER_AUTH_URL_DEVELOPMENT:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL_DEVELOPMENT,
    NEXT_PUBLIC_BETTER_AUTH_URL_PRODUCTION:
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL_PRODUCTION,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
