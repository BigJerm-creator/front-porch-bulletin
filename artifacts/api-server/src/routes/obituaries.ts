import { Router } from "express";
import { db, obituariesTable, articlesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const [dedicated, articleObits] = await Promise.all([
    db.select().from(obituariesTable).orderBy(desc(obituariesTable.createdAt)),
    db
      .select()
      .from(articlesTable)
      .where(and(eq(articlesTable.category, "Obituaries"), eq(articlesTable.archived, false)))
      .orderBy(desc(articlesTable.publishedAt)),
  ]);

  const fromArticles = articleObits.map((a) => ({
    id: `article-${a.id}`,
    name: a.title,
    birthDate: null,
    deathDate: null,
    hometown: null,
    content: a.content,
    photoUrl: a.photoUrl ?? null,
    createdAt: a.publishedAt,
    updatedAt: a.updatedAt,
  }));

  res.json({ obituaries: [...dedicated, ...fromArticles] });
});

router.post("/", requireApproved, async (req, res) => {
  const { name, birthDate, deathDate, hometown, content, photoUrl } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: "name and content are required" });
    return;
  }

  const [obituary] = await db
    .insert(obituariesTable)
    .values({ name, birthDate: birthDate ?? null, deathDate: deathDate ?? null, hometown: hometown ?? null, content, photoUrl: photoUrl ?? null })
    .returning();
  res.status(201).json(obituary);
});

router.put("/:id", requireApproved, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { name, birthDate, deathDate, hometown, content, photoUrl } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: "name and content are required" });
    return;
  }

  const [obituary] = await db
    .update(obituariesTable)
    .set({ name, birthDate: birthDate ?? null, deathDate: deathDate ?? null, hometown: hometown ?? null, content, photoUrl: photoUrl ?? null, updatedAt: new Date() })
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
