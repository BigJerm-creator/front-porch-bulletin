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

export default router;
