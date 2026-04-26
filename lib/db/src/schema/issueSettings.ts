import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const issueSettingsTable = pgTable("issue_settings", {
  id: serial("id").primaryKey(),
  issueNumber: text("issue_number").notNull().default("01"),
  issueYear: integer("issue_year").notNull().default(2026),
  issueMonth: integer("issue_month").notNull().default(5),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type IssueSettings = typeof issueSettingsTable.$inferSelect;
