import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRolesTable = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: text("role").notNull().default("approved_user"),
  grantedAt: timestamp("granted_at").notNull().defaultNow(),
});

export const insertUserRoleSchema = createInsertSchema(userRolesTable).omit({
  id: true,
  grantedAt: true,
});

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRolesTable.$inferSelect;
