import { pgTable, text, serial, timestamp, json } from "drizzle-orm/pg-core";

export const businessSpotlightTable = pgTable("business_spotlight", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: json("photos").$type<Array<{ url: string; credit: string }>>(),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type BusinessSpotlight = typeof businessSpotlightTable.$inferSelect;
