import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db, accounts, sessions, users, verifications } from "@baiqueee/db";
import { apiEnv } from "@baiqueee/env/api";

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
  baseURL: apiEnv.BETTER_AUTH_URL,
  secret: apiEnv.BETTER_AUTH_SECRET,
  trustedOrigins: [apiEnv.CORS_ORIGIN],
  socialProviders: {
    google: {
      clientId: apiEnv.GOOGLE_CLIENT_ID,
      clientSecret: apiEnv.GOOGLE_CLIENT_SECRET,
    },
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
