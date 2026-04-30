import { ORPCError, os } from "@orpc/server";

import { auth } from "@baiqueee/auth/server";
import { db } from "@baiqueee/db";

type RPCContext = Awaited<ReturnType<typeof createRPCContext>>;
type AuthenticatedRPCContext = Omit<RPCContext, "session"> & {
  session: NonNullable<RPCContext["session"]>;
};

export async function createRPCContext(opts: { headers: Headers }) {
  const authData = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    db,
    session: authData?.session
      ? { session: authData.session, user: authData.user }
      : null,
    ...opts,
  };
}

const rpc = os.$context<RPCContext>();

const authMiddleware = rpc.middleware(async ({ context, next }) => {
  const session = context.session;

  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      ...context,
      session,
    } as AuthenticatedRPCContext,
  });
});

const adminMiddleware = rpc.middleware(async ({ context, next }) => {
  if (context.session?.user.role !== "admin") {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({ context: context as AuthenticatedRPCContext });
});

export const publicProcedure = rpc;
export const privateProcedure = rpc.use(authMiddleware);
export const adminProcedure = privateProcedure.use(adminMiddleware);

export type { RPCContext };
