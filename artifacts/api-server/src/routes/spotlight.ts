import { Router } from "express";
import { db, spotlightTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const [spotlight] = await db
    .select()
    .from(spotlightTable)
    .orderBy(desc(spotlightTable.updatedAt))
    .limit(1);

  if (!spotlight) {
    res.status(404).json({ error: "No spotlight set" });
    return;
  }

  res.json(spotlight);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, school, grade, description, photoUrl } = req.body;
  if (!name || !school || !grade || !description) {
    res.status(400).json({ error: "name, school, grade, and description are required" });
    return;
  }

  const existing = await db.select().from(spotlightTable).orderBy(desc(spotlightTable.updatedAt)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(spotlightTable)
      .set({ name, school, grade, description, photoUrl: photoUrl ?? null, updatedAt: new Date() })
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(spotlightTable)
      .values({ name, school, grade, description, photoUrl: photoUrl ?? null })
      .returning();
    res.json(created);
  }
});

export default router;
