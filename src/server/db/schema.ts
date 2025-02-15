// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  index,
  pgEnum,
  pgTable,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { cuid2 } from "drizzle-cuid2/postgres";

export const rolesEnum = pgEnum("roles", ["user", "admin"]);

export const users = pgTable("user", {
  id: cuid2("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: rolesEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessions = pgTable("session", {
  id: cuid2("id").defaultRandom().primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("account", {
  id: cuid2("id").defaultRandom().primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
  id: cuid2("id").defaultRandom().primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const logs = pgTable(
  "logs",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    indexes: [index("Log_created_at_idx").on(table.createdAt)],
  }),
);

export const posts = pgTable(
  "posts",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    publishedAt: timestamp("publishedAt"),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    indexes: [index("Post_name_idx").on(table.title)],
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    image: text("image").notNull(),
    description: text("description").notNull(),
    websiteLink: text("website_link"),
    githubLink: text("github_link"),
    youtubeLink: text("youtube_link"),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    indexes: [index("Project_name_idx").on(table.name)],
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: cuid2("id").defaultRandom().primaryKey(),
    userId: cuid2("user_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    indexes: [index("Comment_user_id_idx").on(table.userId)],
  }),
);
