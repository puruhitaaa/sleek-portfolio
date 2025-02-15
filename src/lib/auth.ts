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
    process.env.NODE_ENV === "development"
      ? process.env.BETTER_AUTH_URL_DEVELOPMENT
      : process.env.BETTER_AUTH_URL_PRODUCTION,
  secret: process.env.BETTER_AUTH_SECRET,
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
