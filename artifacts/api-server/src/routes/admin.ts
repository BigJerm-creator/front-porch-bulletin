import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userRolesTable, articlesTable, spotlightTable, businessSpotlightTable, groupSpotlightTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, requireApproved } from "../middlewares/auth";
import { SetUserRoleBody, SetUserRoleParams, RevokeUserRoleParams } from "@workspace/api-zod";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const auth = getAuth(req);
  const userId = auth?.userId!;

  const [roleRow] = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.clerkUserId, userId));

  res.json({
    clerkUserId: userId,
    role: roleRow?.role ?? null,
    isAdmin: roleRow?.role === "admin",
    isApproved: !!roleRow,
  });
});

router.get("/users", requireAdmin, async (_req, res) => {
  const users = await db.select().from(userRolesTable);
  res.json({ users });
});

router.put("/users/:clerkUserId/role", requireAdmin, async (req, res) => {
  const paramParse = SetUserRoleParams.safeParse({ clerkUserId: req.params.clerkUserId });
  if (!paramParse.success) {
    res.status(400).json({ error: paramParse.error.message });
    return;
  }

  const bodyParse = SetUserRoleBody.safeParse(req.body);
  if (!bodyParse.success) {
    res.status(400).json({ error: bodyParse.error.message });
    return;
  }

  const { clerkUserId } = paramParse.data;
  const { role } = bodyParse.data;

  const existing = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.clerkUserId, clerkUserId));

  let result;
  if (existing.length > 0) {
    [result] = await db
      .update(userRolesTable)
      .set({ role })
      .where(eq(userRolesTable.clerkUserId, clerkUserId))
      .returning();
  } else {
    [result] = await db
      .insert(userRolesTable)
      .values({ clerkUserId, role })
      .returning();
  }

  res.json(result);
});

router.delete("/users/:clerkUserId/role", requireAdmin, async (req, res) => {
  const paramParse = RevokeUserRoleParams.safeParse({ clerkUserId: req.params.clerkUserId });
  if (!paramParse.success) {
    res.status(400).json({ error: paramParse.error.message });
    return;
  }

  await db
    .delete(userRolesTable)
    .where(eq(userRolesTable.clerkUserId, paramParse.data.clerkUserId));

  res.status(204).send();
});

router.get("/draft-count", requireApproved, async (_req, res) => {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articlesTable)
    .where(eq(articlesTable.status, "draft"));

  res.json({ count: result?.count ?? 0 });
});

router.post("/publish-edition", requireApproved, async (_req, res) => {
  const publishedArticles = await db
    .update(articlesTable)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(articlesTable.status, "draft"))
    .returning({ id: articlesTable.id });

  async function publishSpotlight<T extends { id: number; status: string }>(
    table: Parameters<typeof db.select>[0] extends never ? any : any,
    getFields: (row: T) => Record<string, unknown>,
  ) {
    const [draft] = await db.select().from(table).where(eq((table as any).status, "draft")).limit(1);
    if (!draft) return;
    const [published] = await db.select().from(table).where(eq((table as any).status, "published")).limit(1);
    if (published) {
      await db.update(table).set({ ...getFields(draft as T), updatedAt: new Date() }).where(eq((table as any).id, published.id));
    } else {
      await db.update(table).set({ status: "published" }).where(eq((table as any).id, draft.id));
    }
  }

  await Promise.all([
    publishSpotlight(spotlightTable, (d: typeof spotlightTable.$inferSelect) => ({
      name: d.name, school: d.school, grade: d.grade, description: d.description, photoUrl: d.photoUrl, photoCredit: d.photoCredit,
    })),
    publishSpotlight(businessSpotlightTable, (d: typeof businessSpotlightTable.$inferSelect) => ({
      name: d.name, businessType: d.businessType, description: d.description, photoUrl: d.photoUrl, photoCredit: d.photoCredit,
    })),
    publishSpotlight(groupSpotlightTable, (d: typeof groupSpotlightTable.$inferSelect) => ({
      name: d.name, groupType: d.groupType, description: d.description, photoUrl: d.photoUrl, photoCredit: d.photoCredit,
    })),
  ]);

  res.json({ published: publishedArticles.length });
});

export default router;
