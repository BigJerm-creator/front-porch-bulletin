import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const businessSpotlightTable = pgTable("business_spotlight", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BusinessSpotlight = typeof businessSpotlightTable.$inferSelect;
