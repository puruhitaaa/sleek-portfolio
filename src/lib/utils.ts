import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
