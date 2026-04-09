import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const churchesTable = pgTable("churches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  pastor: text("pastor").notNull(),
  serviceTimes: text("service_times").notNull(),
  phone: text("phone").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Church = typeof churchesTable.$inferSelect;
