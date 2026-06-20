import { createClerkClient } from "@clerk/backend";
import type { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { userRolesTable } from "./schema";
import type { Env } from "./index";

export function getClerk(env: Env) {
  return createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
}

export async function getUserId(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const clerk = getClerk(c.env);
    const payload = await clerk.verifyToken(token);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth(c: Context<{ Bindings: Env }>): Promise<string | Response> {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  return userId;
}

export async function requireApproved(
  c: Context<{ Bindings: Env }>
): Promise<{ userId: string; role: string } | Response> {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.clerkUserId, userId));
  if (!roleRow) return c.json({ error: "Your account is pending approval" }, 403);
  return { userId, role: roleRow.role };
}

export async function requireAdmin(
  c: Context<{ Bindings: Env }>
): Promise<{ userId: string; role: string } | Response> {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.clerkUserId, userId));
  if (!roleRow || roleRow.role !== "admin") return c.json({ error: "Admin access required" }, 403);
  return { userId, role: roleRow.role };
}

export async function checkIsApprovedStaff(c: Context<{ Bindings: Env }>): Promise<boolean> {
  const userId = await getUserId(c);
  if (!userId) return false;
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.clerkUserId, userId));
  return !!roleRow;
}

export async function checkIsAdmin(c: Context<{ Bindings: Env }>): Promise<boolean> {
  const userId = await getUserId(c);
  if (!userId) return false;
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.clerkUserId, userId));
  return roleRow?.role === "admin";
}
