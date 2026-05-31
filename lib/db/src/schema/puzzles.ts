import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const puzzlesTable = pgTable("puzzles", {
  id: serial("id").primaryKey(),
  crosswordUrl: text("crossword_url"),
  wordSearchUrl: text("word_search_url"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Puzzle = typeof puzzlesTable.$inferSelect;
