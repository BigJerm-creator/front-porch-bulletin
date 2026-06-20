import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { userRolesTable } from "./schema";
import type { Env } from "./index";

// ── HS256 JWT via Web Crypto API ─────────────────────────────────────────────

function b64url(buf: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  return Uint8Array.from(
    atob(s.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );
}

async function hmacKey(secret: string, usage: string[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage,
  );
}

export async function signJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const enc = (v: unknown) => b64url(new TextEncoder().encode(JSON.stringify(v)));
  const header = enc({ alg: "HS256", typ: "JWT" });
  const body = enc(payload);
  const data = `${header}.${body}`;
  const sig = b64url(
    await crypto.subtle.sign("HMAC", await hmacKey(secret, ["sign"]), new TextEncoder().encode(data)),
  );
  return `${data}.${sig}`;
}

export async function verifyJWT(token: string, secret: string): Promise<Record<string, unknown>> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("malformed jwt");
  const [header, body, sig] = parts;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await hmacKey(secret, ["verify"]),
    b64urlDecode(sig),
    new TextEncoder().encode(`${header}.${body}`),
  );
  if (!valid) throw new Error("invalid signature");
  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)));
  if (payload.exp && Date.now() / 1000 > payload.exp) throw new Error("token expired");
  return payload;
}

// ── Session helpers ──────────────────────────────────────────────────────────

export async function getUserId(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const token = getCookie(c, "session");
  if (!token) return null;
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    return (payload.sub as string) ?? null;
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
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  if (!roleRow) return c.json({ error: "Your account is pending approval" }, 403);
  return { userId, role: roleRow.role };
}

export async function requireAdmin(
  c: Context<{ Bindings: Env }>
): Promise<{ userId: string; role: string } | Response> {
  const userId = await getUserId(c);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  if (!roleRow || roleRow.role !== "admin") return c.json({ error: "Admin access required" }, 403);
  return { userId, role: roleRow.role };
}

export async function checkIsApprovedStaff(c: Context<{ Bindings: Env }>): Promise<boolean> {
  const userId = await getUserId(c);
  if (!userId) return false;
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  return !!roleRow;
}

export async function checkIsAdmin(c: Context<{ Bindings: Env }>): Promise<boolean> {
  const userId = await getUserId(c);
  if (!userId) return false;
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  return roleRow?.role === "admin";
}
