import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, articlesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const cats = await db.select().from(categoriesTable);

  const withCounts = await Promise.all(
    cats.map(async (cat) => {
      const [result] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(articlesTable)
        .where(eq(articlesTable.category, cat.name));
      return { ...cat, articleCount: result?.count ?? 0 };
    })
  );

  res.json({ categories: withCounts });
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { name, slug, description } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "name and slug are required" });

  const [updated] = await db
    .update(categoriesTable)
    .set({ name, slug, description: description || null })
    .where(eq(categoriesTable.id, id))
    .returning();

  if (!updated) return res.status(404).json({ error: "Category not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [deleted] = await db
    .delete(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .returning();

  if (!deleted) return res.status(404).json({ error: "Category not found" });
  res.json({ success: true });
});

export default router;
