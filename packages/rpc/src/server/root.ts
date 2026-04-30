import { cloudinaryRouter } from "./routers/cloudinary";
import { guestbookRouter } from "./routers/guestbook";
import { logsRouter } from "./routers/logs";
import { postRouter } from "./routers/post";
import { projectRouter } from "./routers/project";
import { spotifyRouter } from "./routers/spotify";

export const appRouter = {
  post: postRouter,
  project: projectRouter,
  guestbook: guestbookRouter,
  spotify: spotifyRouter,
  logs: logsRouter,
  cloudinary: cloudinaryRouter,
} as const;

export type AppRouter = typeof appRouter;
