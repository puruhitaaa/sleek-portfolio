import { headers } from "next/headers";

import { createRpcClient } from "@baiqueee/rpc";
import { apiBaseUrl } from "@/lib/api-base-url";

export const api = createRpcClient(apiBaseUrl, async () => {
  return new Headers(await headers());
});
