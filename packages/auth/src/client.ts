import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { Auth } from "./server";

export function createBrowserAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [inferAdditionalFields<Auth>()],
  });
}
