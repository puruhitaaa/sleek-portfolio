# Baiqueee Web

This package contains the Next.js frontend for the monorepo.

## Workspace layout

- `apps/web`: Next.js app
- `apps/api`: ElysiaJS backend
- `packages/auth`: Better Auth setup
- `packages/db`: Drizzle schema and database client
- `packages/env`: shared env parsing
- `packages/rpc`: shared oRPC router, client, and server helpers

## Environment

Copy `apps/web/.env.example` to `apps/web/.env` and `apps/api/.env.example` to `apps/api/.env`.

## Local development

From the repository root:

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:3001`.
