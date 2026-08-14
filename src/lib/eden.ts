import { treaty } from "@elysiajs/eden";
import type { App } from "@/server/elysia";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const client = treaty<App>(getBaseUrl());
export const api = client.api;
