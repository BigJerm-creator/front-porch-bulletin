import { Router } from "express";
import { db, puzzlesTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const [puzzles] = await db
    .select()
    .from(puzzlesTable)
    .where(eq(puzzlesTable.status, "published"))
    .orderBy(desc(puzzlesTable.updatedAt))
    .limit(1);

  if (!puzzles) {
    res.status(404).json({ error: "No puzzles set" });
    return;
  }

  res.json(puzzles);
});

router.put("/", requireApproved, async (req, res) => {
  const { crosswordUrl, wordSearchUrl } = req.body;

  const [existing] = await db
    .select()
    .from(puzzlesTable)
    .where(eq(puzzlesTable.status, "published"))
    .orderBy(desc(puzzlesTable.updatedAt))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(puzzlesTable)
      .set({ crosswordUrl: crosswordUrl ?? null, wordSearchUrl: wordSearchUrl ?? null, updatedAt: new Date() })
      .where(eq(puzzlesTable.id, existing.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(puzzlesTable)
      .values({ crosswordUrl: crosswordUrl ?? null, wordSearchUrl: wordSearchUrl ?? null, status: "published" })
      .returning();
    res.json(created);
  }
});

export default router;
