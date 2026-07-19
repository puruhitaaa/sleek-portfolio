import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RouterClient } from "@orpc/server";

import type { AppRouter } from "./server";

type HeaderSource = HeadersInit | (() => HeadersInit | Promise<HeadersInit>);

export function createRpcClient(
  baseUrl: string,
  headers?: HeaderSource,
): RouterClient<AppRouter> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  const link = new RPCLink({
    url: `${normalizedBaseUrl}/rpc`,
    headers: async () => {
      if (!headers) {
        return new Headers();
      }

      const value = typeof headers === "function" ? await headers() : headers;
      return new Headers(value);
    },
    fetch: (request, init) =>
      fetch(request, {
        ...init,
        credentials: "include",
      }),
  });

  return createORPCClient(link) as RouterClient<AppRouter>;
}

export function createRpcQueryUtils(client: RouterClient<AppRouter>) {
  return createTanstackQueryUtils(client);
}
