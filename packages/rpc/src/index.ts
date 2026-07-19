export * from "./client";

import type { InferRouterInputs, InferRouterOutputs } from "@orpc/server";

import type { AppRouter } from "./server/root";
import type { RPCContext } from "./server/orpc";

export type RouterInputs = InferRouterInputs<AppRouter>;
export type RouterOutputs = InferRouterOutputs<AppRouter>;
export type { AppRouter, RPCContext };
