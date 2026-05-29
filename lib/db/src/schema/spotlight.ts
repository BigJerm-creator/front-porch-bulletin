import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const spotlightTable = pgTable("student_spotlight", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  school: text("school").notNull(),
  grade: text("grade").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Spotlight = typeof spotlightTable.$inferSelect;
