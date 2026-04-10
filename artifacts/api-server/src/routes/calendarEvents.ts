import { Router } from "express";
import { db } from "@workspace/db";
import { calendarEventsTable } from "@workspace/db";
import { eq, gte, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const events = await db
    .select()
    .from(calendarEventsTable)
    .where(gte(calendarEventsTable.eventDate, today))
    .orderBy(asc(calendarEventsTable.eventDate), asc(calendarEventsTable.eventTime))
    .limit(20);
  res.json({ events });
});

router.get("/all", async (_req, res) => {
  const events = await db
    .select()
    .from(calendarEventsTable)
    .orderBy(asc(calendarEventsTable.eventDate), asc(calendarEventsTable.eventTime));
  res.json({ events });
});

router.post("/", async (req, res) => {
  const { title, eventDate, eventTime, location, description } = req.body;
  if (!title || !eventDate) return res.status(400).json({ error: "title and eventDate are required" });

  const [created] = await db
    .insert(calendarEventsTable)
    .values({ title, eventDate, eventTime: eventTime || null, location: location || null, description: description || null })
    .returning();
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { title, eventDate, eventTime, location, description } = req.body;
  if (!title || !eventDate) return res.status(400).json({ error: "title and eventDate are required" });

  const [updated] = await db
    .update(calendarEventsTable)
    .set({ title, eventDate, eventTime: eventTime || null, location: location || null, description: description || null })
    .where(eq(calendarEventsTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Event not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [deleted] = await db
    .delete(calendarEventsTable)
    .where(eq(calendarEventsTable.id, id))
    .returning();

  if (!deleted) return res.status(404).json({ error: "Event not found" });
  res.json({ success: true });
});

export default router;
