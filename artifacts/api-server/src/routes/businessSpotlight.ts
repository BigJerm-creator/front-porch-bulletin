import { Router } from "express";
import { db, businessSpotlightTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const [spotlight] = await db
    .select()
    .from(businessSpotlightTable)
    .orderBy(desc(businessSpotlightTable.updatedAt))
    .limit(1);

  if (!spotlight) {
    res.status(404).json({ error: "No business spotlight set" });
    return;
  }

  res.json(spotlight);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, businessType, description, photoUrl, photoCredit } = req.body;
  if (!name || !businessType || !description) {
    res.status(400).json({ error: "name, businessType, and description are required" });
    return;
  }

  const existing = await db.select().from(businessSpotlightTable).orderBy(desc(businessSpotlightTable.updatedAt)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(businessSpotlightTable)
      .set({ name, businessType, description, photoUrl: photoUrl ?? null, photoCredit: photoCredit ?? null, updatedAt: new Date() })
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(businessSpotlightTable)
      .values({ name, businessType, description, photoUrl: photoUrl ?? null, photoCredit: photoCredit ?? null })
      .returning();
    res.json(created);
  }
});

export default router;
