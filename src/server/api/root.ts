import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { guestbookRouter } from "@/server/api/routers/guestbook";
import { spotifyRouter } from "@/server/api/routers/spotify";
import { projectRouter } from "@/server/api/routers/project";
import { logsRouter } from "@/server/api/routers/logs";
import { cloudinaryRouter } from "@/server/api/routers/cloudinary";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  project: projectRouter,
  guestbook: guestbookRouter,
  spotify: spotifyRouter,
  logs: logsRouter,
  cloudinary: cloudinaryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
