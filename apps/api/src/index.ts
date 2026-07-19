import { cors } from "@elysiajs/cors";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Elysia } from "elysia";

import { auth } from "@baiqueee/auth/server";
import { apiEnv } from "@baiqueee/env/api";
import { appRouter, createRPCContext } from "@baiqueee/rpc/server";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error: unknown) => {
      console.error(error);
    }),
  ],
});

export const app = new Elysia()
  .use(
    cors({
      origin: apiEnv.CORS_ORIGIN,
      credentials: true,
    }),
  )
  .get("/health", () => ({ ok: true }))
  .mount(auth.handler)
  .all(
    "/rpc*",
    async ({ request }) => {
      const { response } = await rpcHandler.handle(request, {
        prefix: "/rpc",
        context: await createRPCContext({ headers: request.headers }),
      });

      return response ?? new Response("Not Found", { status: 404 });
    },
    {
      parse: "none",
    },
  );

if (import.meta.main) {
  app.listen(apiEnv.PORT);

  console.log(
    `🦊 Elysia API running at http://${app.server?.hostname}:${app.server?.port}`,
  );
}
