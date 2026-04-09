import { pgTable, text, serial, timestamp, date } from "drizzle-orm/pg-core";

export const obituariesTable = pgTable("obituaries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: date("birth_date"),
  deathDate: date("death_date"),
  hometown: text("hometown"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Obituary = typeof obituariesTable.$inferSelect;
