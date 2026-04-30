import { createBrowserAuthClient } from "@baiqueee/auth";

import { apiBaseUrl } from "@/lib/api-base-url";

const authClient = createBrowserAuthClient(apiBaseUrl);

export const { signIn, signOut, useSession } = authClient;
