import { pgTable, text, serial, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const calendarEventsTable = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventDate: date("event_date").notNull(),
  eventTime: text("event_time"),
  location: text("location"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEventsTable).omit({
  id: true,
  createdAt: true,
});

export type CalendarEvent = typeof calendarEventsTable.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
