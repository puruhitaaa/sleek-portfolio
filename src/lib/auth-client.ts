import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "./auth";

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BETTER_AUTH_URL_DEVELOPMENT
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL_PRODUCTION,
  plugins: [inferAdditionalFields<Auth>()],
});
