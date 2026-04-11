import { Router } from "express";
import { db, groupSpotlightTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const [spotlight] = await db
    .select()
    .from(groupSpotlightTable)
    .orderBy(desc(groupSpotlightTable.updatedAt))
    .limit(1);

  if (!spotlight) {
    res.status(404).json({ error: "No group spotlight set" });
    return;
  }

  res.json(spotlight);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, groupType, description, photoUrl, photoCredit } = req.body;
  if (!name || !groupType || !description) {
    res.status(400).json({ error: "name, groupType, and description are required" });
    return;
  }

  const existing = await db.select().from(groupSpotlightTable).orderBy(desc(groupSpotlightTable.updatedAt)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(groupSpotlightTable)
      .set({ name, groupType, description, photoUrl: photoUrl ?? null, photoCredit: photoCredit ?? null, updatedAt: new Date() })
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(groupSpotlightTable)
      .values({ name, groupType, description, photoUrl: photoUrl ?? null, photoCredit: photoCredit ?? null })
      .returning();
    res.json(created);
  }
});

export default router;
