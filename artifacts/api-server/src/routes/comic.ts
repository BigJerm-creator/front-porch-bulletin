import { Router } from "express";
import { db, comicsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const [comic] = await db
    .select()
    .from(comicsTable)
    .where(eq(comicsTable.status, "published"))
    .orderBy(desc(comicsTable.updatedAt))
    .limit(1);

  if (!comic) {
    res.status(404).json({ error: "No comic set" });
    return;
  }

  res.json(comic);
});

router.put("/", requireApproved, async (req, res) => {
  const { imageUrl, caption } = req.body;

  const [existing] = await db
    .select()
    .from(comicsTable)
    .where(eq(comicsTable.status, "published"))
    .orderBy(desc(comicsTable.updatedAt))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(comicsTable)
      .set({ imageUrl: imageUrl ?? null, caption: caption ?? null, updatedAt: new Date() })
      .where(eq(comicsTable.id, existing.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(comicsTable)
      .values({ imageUrl: imageUrl ?? null, caption: caption ?? null, status: "published" })
      .returning();
    res.json(created);
  }
});

export default router;
