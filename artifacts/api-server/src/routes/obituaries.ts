import { Router } from "express";
import { db, obituariesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const obituaries = await db
    .select()
    .from(obituariesTable)
    .orderBy(desc(obituariesTable.createdAt));

  res.json({ obituaries });
});

router.post("/", requireApproved, async (req, res) => {
  const { name, birthDate, deathDate, hometown, content } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: "name and content are required" });
    return;
  }

  const [obituary] = await db
    .insert(obituariesTable)
    .values({ name, birthDate: birthDate ?? null, deathDate: deathDate ?? null, hometown: hometown ?? null, content })
    .returning();
  res.status(201).json(obituary);
});

router.put("/:id", requireApproved, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { name, birthDate, deathDate, hometown, content } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: "name and content are required" });
    return;
  }

  const [obituary] = await db
    .update(obituariesTable)
    .set({ name, birthDate: birthDate ?? null, deathDate: deathDate ?? null, hometown: hometown ?? null, content, updatedAt: new Date() })
    .where(eq(obituariesTable.id, id))
    .returning();

  if (!obituary) {
    res.status(404).json({ error: "Obituary not found" });
    return;
  }

  res.json(obituary);
});

router.delete("/:id", requireApproved, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(obituariesTable).where(eq(obituariesTable.id, id));
  res.status(204).send();
});

export default router;
