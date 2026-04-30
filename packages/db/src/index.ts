import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { apiEnv } from "@baiqueee/env/api";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(apiEnv.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

export { and, asc, desc, eq, lt } from "drizzle-orm";
export * from "./schema";
