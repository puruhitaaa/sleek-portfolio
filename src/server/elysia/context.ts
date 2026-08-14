import { Elysia, status } from "elysia";
import { db } from "@/server/db";
import { auth } from "@/lib/auth";

export const authPlugin = new Elysia({ name: "auth" })
  .derive({ as: "scoped" }, async ({ request }) => {
    const authData = await auth.api.getSession({
      headers: request.headers,
    });

    return {
      db,
      session: authData?.session ?? null,
      user: authData?.user ?? null,
    };
  })
  .macro({
    isAuth(enabled: boolean) {
      if (!enabled) return;

      return {
        beforeHandle({ session, user }) {
          if (!session || !user) {
            return status(401, { message: "Unauthorized" });
          }
        },
      };
    },
    isAdmin(enabled: boolean) {
      if (!enabled) return;

      return {
        beforeHandle({ session, user }) {
          if (!session || !user) {
            return status(401, { message: "Unauthorized" });
          }
          if (user.role !== "admin") {
            return status(403, { message: "Forbidden: Admin access required" });
          }
        },
      };
    },
  });
