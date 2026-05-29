import { pgTable, text, serial, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").notNull().default(false),
  page2Featured: boolean("page2_featured").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  status: text("status").notNull().default("published"),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: json("photos").$type<Array<{ url: string; credit: string }>>(),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;
