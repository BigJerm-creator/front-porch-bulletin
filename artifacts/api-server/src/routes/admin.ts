import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userRolesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
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

export default router;
