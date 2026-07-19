import type { RouterInputs, RouterOutputs } from "@baiqueee/rpc";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type RouterInput = RouterInputs;
export type RouterOutput = RouterOutputs;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
