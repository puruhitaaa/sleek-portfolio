import { env } from "@/env";
import { db } from "@/server/db";
import { accounts, sessions, users, verifications } from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
  baseURL:
    env.NODE_ENV === "development"
      ? env.NEXT_PUBLIC_BETTER_AUTH_URL_DEVELOPMENT
      : env.NEXT_PUBLIC_BETTER_AUTH_URL_PRODUCTION,
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
