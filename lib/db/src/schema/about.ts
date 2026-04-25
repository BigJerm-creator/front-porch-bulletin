import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const aboutContentTable = pgTable("about_content", {
  id: serial("id").primaryKey(),
  foundingYear: text("founding_year").notNull().default("1924"),
  body: text("body").notNull().default(""),
  editorialStaff: text("editorial_staff").notNull().default("[]"),
  officeLocation: text("office_location").notNull().default("Main Street"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AboutContent = typeof aboutContentTable.$inferSelect;
