import { Router } from "express";
import { db } from "@workspace/db";
import { articlesTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  ListArticlesQueryParams,
  CreateArticleBody,
  GetArticleParams,
  UpdateArticleParams,
  UpdateArticleBody,
  DeleteArticleParams,
  ArchiveArticleParams,
  ArchiveArticleBody,
} from "@workspace/api-zod";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const parse = ListArticlesQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }
  const { category, featured, limit = 20, offset = 0, includeArchived = false } = parse.data;

  const conditions = [];
  if (!includeArchived) conditions.push(eq(articlesTable.archived, false));
  if (category) conditions.push(eq(articlesTable.category, category));
  if (featured !== undefined) conditions.push(eq(articlesTable.featured, featured));

  const [articles, countResult] = await Promise.all([
    db
      .select()
      .from(articlesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(articlesTable.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(articlesTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  res.json({ articles, total: countResult[0]?.count ?? 0 });
});

router.post("/", requireApproved, async (req, res) => {
  const parse = CreateArticleBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { publishedAt, ...rest } = parse.data;
  const [article] = await db
    .insert(articlesTable)
    .values({
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    })
    .returning();

  res.status(201).json(article);
});

router.get("/featured", async (_req, res) => {
  const articles = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.archived, false))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(20);

  const headline = articles.find((a) => a.featured) ?? articles[0] ?? null;

  const eventCategories = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.showInEvents, true));

  const eventCategoryNames = new Set(eventCategories.map((c) => c.name));

  const secondary = articles
    .filter((a) => a.id !== headline?.id && eventCategoryNames.has(a.category))
    .slice(0, 5);

  res.json({ headline, secondary });
});

router.get("/summary", async (_req, res) => {
  const [totalResult, categoryResult, recentResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(articlesTable),
    db
      .select({
        category: articlesTable.category,
        count: sql<number>`count(*)::int`,
      })
      .from(articlesTable)
      .groupBy(articlesTable.category),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(articlesTable)
      .where(
        sql`published_at > now() - interval '7 days'`
      ),
  ]);

  res.json({
    totalArticles: totalResult[0]?.count ?? 0,
    totalCategories: categoryResult.length,
    byCategory: categoryResult,
    recentCount: recentResult[0]?.count ?? 0,
  });
});

router.get("/:id", async (req, res) => {
  const parse = GetArticleParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const [article] = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.id, parse.data.id));

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.put("/:id", requireApproved, async (req, res) => {
  const paramParse = UpdateArticleParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) {
    res.status(400).json({ error: paramParse.error.message });
    return;
  }

  const bodyParse = UpdateArticleBody.safeParse(req.body);
  if (!bodyParse.success) {
    res.status(400).json({ error: bodyParse.error.message });
    return;
  }

  const { publishedAt, ...rest } = bodyParse.data;
  const updateData: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  if (publishedAt) updateData.publishedAt = new Date(publishedAt);

  const [article] = await db
    .update(articlesTable)
    .set(updateData)
    .where(eq(articlesTable.id, paramParse.data.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.patch("/:id/archive", requireApproved, async (req, res) => {
  const paramParse = ArchiveArticleParams.safeParse({ id: Number(req.params.id) });
  if (!paramParse.success) {
    res.status(400).json({ error: paramParse.error.message });
    return;
  }

  const bodyParse = ArchiveArticleBody.safeParse(req.body);
  if (!bodyParse.success) {
    res.status(400).json({ error: bodyParse.error.message });
    return;
  }

  const [article] = await db
    .update(articlesTable)
    .set({ archived: bodyParse.data.archived, updatedAt: new Date() })
    .where(eq(articlesTable.id, paramParse.data.id))
    .returning();

  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(article);
});

router.delete("/:id", requireApproved, async (req, res) => {
  const parse = DeleteArticleParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  await db.delete(articlesTable).where(eq(articlesTable.id, parse.data.id));
  res.status(204).send();
});

export default router;
