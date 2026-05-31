import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const comicsTable = pgTable("comics", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  caption: text("caption"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Comic = typeof comicsTable.$inferSelect;
