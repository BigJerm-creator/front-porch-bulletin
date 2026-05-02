import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userRolesTable, articlesTable } from "@workspace/db";
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
  const result = await db
    .update(articlesTable)
    .set({ status: "published", updatedAt: new Date() })
    .where(eq(articlesTable.status, "draft"))
    .returning({ id: articlesTable.id });

  res.json({ published: result.length });
});

export default router;
