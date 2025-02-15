# Sleek Portfolio Banner

![Sleek Portfolio](https://res.cloudinary.com/dzxwzv1r5/image/upload/v1739641481/hlkwglqh13ch9qayckt3.png)

# Sleek Portfolio

A sleek, full-stack portfolio application built with Next.js, Drizzle ORM, tRPC, and other cutting-edge technologies.

## Prerequisites

- Node.js 18+ (recommended: latest LTS version)
- PostgreSQL database
- Cloudinary account (for image uploads)
- Google OAuth credentials (for authentication)
- Last.fm API key (for music integration)
- Upstash Redis account (for rate limiting)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd sleek-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

   - Copy the `.env.example` file to create a new `.env` file:

   ```bash
   cp .env.example .env
   ```

   - Fill in the following environment variables in your `.env` file:

   ```plaintext
   # Database
   DATABASE_URL=postgresql://your-connection-string

   # Better Auth
   BETTER_AUTH_URL_DEVELOPMENT=http://localhost:3000
   BETTER_AUTH_URL_PRODUCTION=your-production-url
   BETTER_AUTH_SECRET=your-secret-key

   # Frontend API URL
   NEXT_PUBLIC_FRONTEND_API_URL_DEVELOPMENT=http://localhost:3000
   NEXT_PUBLIC_FRONTEND_API_URL_PRODUCTION=your-production-url

   # Last.fm (Optional - for music integration)
   LASTFM_API_KEY=your-lastfm-api-key
   LASTFM_USERNAME=your-lastfm-username

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Cloudinary (for image uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_URL=your-cloudinary-url

   # Upstash Redis (for rate limiting)
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

4. Set up the database:

```bash
# Generate the database schema
npm run db:generate

# Push the schema to your database
npm run db:push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run preview` - Build and preview the production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and fix issues
- `npm run format:check` - Check code formatting
- `npm run format:write` - Format code
- `npm run typecheck` - Check TypeScript types
- `npm run db:generate` - Generate database schema
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [Drizzle ORM](https://orm.drizzle.team) - Database ORM
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Better Auth](https://better-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [React Query](https://tanstack.com/query) - Data fetching
- [Radix UI](https://www.radix-ui.com) - UI components
- [Tiptap](https://tiptap.dev) - Rich text editor

## Development Tools

- TypeScript
- ESLint
- Prettier
- Drizzle Kit
- Turbopack

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
