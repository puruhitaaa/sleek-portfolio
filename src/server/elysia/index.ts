import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { guestbookRouter } from "./routers/guestbook";
import { logsRouter } from "./routers/logs";
import { postsRouter } from "./routers/posts";
import { projectsRouter } from "./routers/projects";
import { spotifyRouter } from "./routers/spotify";
import { cloudinaryRouter } from "./routers/cloudinary";
import { bioRouter } from "./routers/bio";

export const app = new Elysia({ prefix: "/api" })
  .use(cors())
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Personal Portfolio API",
          version: "1.0.0",
          description: "ElysiaJS Backend API for Portfolio, Blog, Guestbook, and Projects",
        },
        tags: [
          { name: "Guestbook", description: "Guestbook comments and reactions" },
          { name: "Posts", description: "Blog posts and articles" },
          { name: "Projects", description: "Portfolio projects showcase" },
          { name: "Logs", description: "Development and activity logs" },
          { name: "Spotify", description: "Spotify now playing widget" },
          { name: "Cloudinary", description: "Image upload and management" },
          { name: "Bio", description: "Biography and introduction content" },
        ],
      },
    }),
  )
  .use(guestbookRouter)
  .use(logsRouter)
  .use(postsRouter)
  .use(projectsRouter)
  .use(spotifyRouter)
  .use(cloudinaryRouter)
  .use(bioRouter);


export type App = typeof app;
