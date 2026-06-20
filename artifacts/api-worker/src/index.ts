import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import { Resend } from "resend";
import Stripe from "stripe";
import {
  articlesTable, categoriesTable, calendarEventsTable, churchesTable,
  businessSpotlightTable, groupSpotlightTable, studentSpotlightTable,
  newsletterSubscribersTable, userRolesTable, aboutContentTable,
  issueSettingsTable, comicsTable, puzzlesTable,
} from "./schema";
import {
  requireAuth, requireApproved, requireAdmin,
  checkIsApprovedStaff, checkIsAdmin, getUserId, signJWT, verifyJWT,
} from "./auth";

export type Env = {
  DB: D1Database;
  STORAGE: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  SITE_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/healthz", (c) => c.json({ status: "ok" }));

// ─── Google OAuth ─────────────────────────────────────────────────────────────
app.get("/auth/google", (c) => {
  const state = crypto.randomUUID();
  const siteUrl = c.env.SITE_URL || "https://frontporchbulletin.com";
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${siteUrl}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
  });
  setCookie(c, "oauth_state", state, {
    httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: 600,
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

app.get("/auth/google/callback", async (c) => {
  const { code, state, error } = c.req.query();

  if (error) return c.redirect("/sign-in?error=access_denied");

  const storedState = getCookie(c, "oauth_state");
  if (!state || state !== storedState) return c.redirect("/sign-in?error=invalid_state");

  const siteUrl = c.env.SITE_URL || "https://frontporchbulletin.com";

  // Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${siteUrl}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) return c.redirect("/sign-in?error=token_exchange_failed");
  const tokens = await tokenRes.json() as { access_token: string };

  // Fetch Google user profile
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userRes.ok) return c.redirect("/sign-in?error=profile_fetch_failed");
  const googleUser = await userRes.json() as { id: string; email: string; name: string; picture: string };

  const db = drizzle(c.env.DB);

  // Bootstrap: if no users exist yet, make this person the first admin
  const [existing] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, googleUser.id));
  const totalAdmins = await db.select({ count: sql<number>`count(*)` }).from(userRolesTable);

  if (!existing && Number(totalAdmins[0]?.count ?? 0) === 0) {
    await db.insert(userRolesTable).values({
      userId: googleUser.id,
      role: "admin",
      name: googleUser.name,
      email: googleUser.email,
    });
  } else if (existing) {
    // Update name/email on each login in case they changed
    await db.update(userRolesTable)
      .set({ name: googleUser.name, email: googleUser.email })
      .where(eq(userRolesTable.userId, googleUser.id));
  }

  // Create session JWT
  const jwt = await signJWT({
    sub: googleUser.id,
    email: googleUser.email,
    name: googleUser.name,
    picture: googleUser.picture,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  }, c.env.JWT_SECRET);

  const cookieOpts = { secure: true, sameSite: "Lax" as const, path: "/", maxAge: SESSION_MAX_AGE };

  setCookie(c, "session", jwt, { ...cookieOpts, httpOnly: true });
  // user_info is readable by JS (not httpOnly) for display purposes only
  setCookie(c, "user_info", encodeURIComponent(JSON.stringify({
    name: googleUser.name,
    email: googleUser.email,
    picture: googleUser.picture,
  })), cookieOpts);
  deleteCookie(c, "oauth_state", { path: "/" });

  return c.redirect("/admin");
});

app.get("/auth/signout", (c) => {
  deleteCookie(c, "session", { path: "/" });
  deleteCookie(c, "user_info", { path: "/" });
  return c.redirect("/");
});

// ─── Articles ─────────────────────────────────────────────────────────────────
app.get("/api/articles", async (c) => {
  const db = drizzle(c.env.DB);
  const q = c.req.query();
  const category = q.category;
  const featured = q.featured !== undefined ? q.featured === "true" : undefined;
  const limit = Math.min(Number(q.limit ?? 20), 100);
  const offset = Number(q.offset ?? 0);
  const includeArchived = q.includeArchived === "true";
  const isStaff = await checkIsApprovedStaff(c);

  const conditions: any[] = [];
  if (!includeArchived) {
    conditions.push(eq(articlesTable.archived, false));
    if (!isStaff) conditions.push(eq(articlesTable.status, "published"));
  }
  if (category) conditions.push(eq(articlesTable.category, category));
  if (featured !== undefined) conditions.push(eq(articlesTable.featured, featured));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [articles, countResult] = await Promise.all([
    db.select().from(articlesTable).where(where).orderBy(desc(articlesTable.publishedAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(where),
  ]);
  return c.json({ articles, total: Number(countResult[0]?.count ?? 0) });
});

app.post("/api/articles", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { publishedAt, photos, photoUrl, photoCredit, ...rest } = body;
  const syncedPhotoUrl = photos?.length > 0 ? photos[0].url : (photoUrl ?? null);
  const syncedPhotoCredit = photos?.length > 0 ? (photos[0].credit || null) : (photoCredit ?? null);
  const [article] = await db.insert(articlesTable).values({
    ...rest,
    photos: photos ?? null,
    photoUrl: syncedPhotoUrl,
    photoCredit: syncedPhotoCredit,
    status: "draft",
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
  }).returning();
  return c.json(article, 201);
});

app.get("/api/articles/featured", async (c) => {
  const db = drizzle(c.env.DB);
  const isStaff = await checkIsApprovedStaff(c);
  const featuredWhere = isStaff
    ? eq(articlesTable.archived, false)
    : and(eq(articlesTable.archived, false), eq(articlesTable.status, "published"));

  const [articles, eventCategories] = await Promise.all([
    db.select().from(articlesTable).where(featuredWhere).orderBy(desc(articlesTable.publishedAt)).limit(20),
    db.select({ name: categoriesTable.name }).from(categoriesTable).where(eq(categoriesTable.showInEvents, true)),
  ]);

  const eventCategoryNames = new Set(eventCategories.map((c) => c.name));
  const frontPage = articles.filter((a) => a.featured).sort((a, b) => b.publishedAt > a.publishedAt ? 1 : -1);
  const headline = frontPage[0] ?? articles[0] ?? null;
  const page2 = articles.find((a) => a.page2Featured) ?? null;
  const frontPageIds = new Set(frontPage.map((a) => a.id));
  const secondary = articles
    .filter((a) => !frontPageIds.has(a.id) && a.id !== page2?.id && !eventCategoryNames.has(a.category))
    .slice(0, 5);

  return c.json({ headline, frontPage, secondary, page2 });
});

app.get("/api/articles/summary", async (c) => {
  const db = drizzle(c.env.DB);
  const [totalResult, categoryResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(articlesTable),
    db.select({ category: articlesTable.category, count: sql<number>`count(*)` }).from(articlesTable).groupBy(articlesTable.category),
  ]);
  return c.json({
    totalArticles: Number(totalResult[0]?.count ?? 0),
    totalCategories: categoryResult.length,
    byCategory: categoryResult.map(r => ({ ...r, count: Number(r.count) })),
    recentCount: 0,
  });
});

app.get("/api/articles/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id));
  if (!article) return c.json({ error: "Article not found" }, 404);
  return c.json(article);
});

app.put("/api/articles/:id", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid id" }, 400);
  const body = await c.req.json();
  const { publishedAt, photos, photoUrl, photoCredit, ...rest } = body;
  const syncedPhotoUrl = photos !== undefined ? (photos?.length > 0 ? photos[0].url : null) : photoUrl;
  const syncedPhotoCredit = photos !== undefined ? (photos?.length > 0 ? (photos[0].credit || null) : null) : photoCredit;
  const updateData: any = { ...rest, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, updatedAt: new Date().toISOString() };
  if (photos !== undefined) updateData.photos = photos;
  if (publishedAt) updateData.publishedAt = new Date(publishedAt).toISOString();
  const [article] = await db.update(articlesTable).set(updateData).where(eq(articlesTable.id, id)).returning();
  if (!article) return c.json({ error: "Article not found" }, 404);
  return c.json(article);
});

app.patch("/api/articles/:id/archive", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [article] = await db.update(articlesTable).set({ archived: body.archived, updatedAt: new Date().toISOString() }).where(eq(articlesTable.id, id)).returning();
  if (!article) return c.json({ error: "Article not found" }, 404);
  return c.json(article);
});

app.delete("/api/articles/:id", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  return new Response(null, { status: 204 });
});

// ─── Categories ───────────────────────────────────────────────────────────────
app.get("/api/categories", async (c) => {
  const db = drizzle(c.env.DB);
  const categories = await db.select().from(categoriesTable);
  return c.json({ categories });
});

app.post("/api/categories", async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const [cat] = await db.insert(categoriesTable).values(body).returning();
  return c.json(cat, 201);
});

app.put("/api/categories/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [cat] = await db.update(categoriesTable).set(body).where(eq(categoriesTable.id, id)).returning();
  if (!cat) return c.json({ error: "Category not found" }, 404);
  return c.json(cat);
});

app.delete("/api/categories/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  return new Response(null, { status: 204 });
});

// ─── Calendar Events ──────────────────────────────────────────────────────────
app.get("/api/calendar-events", async (c) => {
  const db = drizzle(c.env.DB);
  const events = await db.select().from(calendarEventsTable)
    .where(sql`event_date >= date('now')`)
    .orderBy(asc(calendarEventsTable.eventDate))
    .limit(20);
  return c.json({ events });
});

app.get("/api/calendar-events/all", async (c) => {
  const db = drizzle(c.env.DB);
  const events = await db.select().from(calendarEventsTable).orderBy(asc(calendarEventsTable.eventDate));
  return c.json({ events });
});

app.get("/api/calendar-events/month/:year/:month", async (c) => {
  const db = drizzle(c.env.DB);
  const year = c.req.param("year");
  const month = c.req.param("month").padStart(2, "0");
  const events = await db.select().from(calendarEventsTable)
    .where(sql`strftime('%Y-%m', event_date) = ${`${year}-${month}`}`)
    .orderBy(asc(calendarEventsTable.eventDate));
  return c.json({ events });
});

app.post("/api/calendar-events", async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const [event] = await db.insert(calendarEventsTable).values(body).returning();
  return c.json(event, 201);
});

app.put("/api/calendar-events/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [event] = await db.update(calendarEventsTable).set(body).where(eq(calendarEventsTable.id, id)).returning();
  if (!event) return c.json({ error: "Event not found" }, 404);
  return c.json(event);
});

app.delete("/api/calendar-events/:id", async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, id));
  return new Response(null, { status: 204 });
});

// ─── Churches ─────────────────────────────────────────────────────────────────
app.get("/api/churches", async (c) => {
  const db = drizzle(c.env.DB);
  const churches = await db.select().from(churchesTable).orderBy(asc(churchesTable.sortOrder));
  return c.json({ churches });
});

app.post("/api/churches", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const [church] = await db.insert(churchesTable).values(body).returning();
  return c.json(church, 201);
});

app.put("/api/churches/:id", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const [church] = await db.update(churchesTable).set(body).where(eq(churchesTable.id, id)).returning();
  if (!church) return c.json({ error: "Church not found" }, 404);
  return c.json(church);
});

app.delete("/api/churches/:id", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param("id"));
  await db.delete(churchesTable).where(eq(churchesTable.id, id));
  return new Response(null, { status: 204 });
});

// ─── Spotlight helpers ────────────────────────────────────────────────────────
function spotlightRoutes(app: Hono<{ Bindings: Env }>, path: string, table: any) {
  app.get(`/api/${path}`, async (c) => {
    const db = drizzle(c.env.DB);
    const isStaff = await checkIsApprovedStaff(c);
    const rows = isStaff
      ? await db.select().from(table).orderBy(desc(table.updatedAt)).limit(1)
      : await db.select().from(table).where(sql`status != 'disabled'`).orderBy(desc(table.updatedAt)).limit(1);
    return c.json(rows[0] ?? null);
  });

  app.put(`/api/${path}`, async (c) => {
    const auth = await requireApproved(c);
    if (auth instanceof Response) return auth;
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    const existing = await db.select().from(table).limit(1);
    if (existing.length > 0) {
      const upd = await (db.update(table).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(table.id, existing[0].id)).returning() as unknown as Promise<any[]>);
      return c.json(upd[0]);
    }
    const ins = await (db.insert(table).values({ ...body, status: "draft" }).returning() as unknown as Promise<any[]>);
    return c.json(ins[0], 201);
  });

  app.patch(`/api/${path}`, async (c) => {
    const auth = await requireApproved(c);
    if (auth instanceof Response) return auth;
    const db = drizzle(c.env.DB);
    const sel = await (db.select().from(table).limit(1) as unknown as Promise<any[]>);
    const row = sel[0];
    if (!row) return c.json({ error: "Not found" }, 404);
    const newStatus = row.status === "published" ? "pending-disable" : "published";
    const upd = await (db.update(table).set({ status: newStatus, updatedAt: new Date().toISOString() }).where(eq(table.id, row.id)).returning() as unknown as Promise<any[]>);
    return c.json(upd[0]);
  });

  app.patch(`/api/${path}/publish`, async (c) => {
    const auth = await requireApproved(c);
    if (auth instanceof Response) return auth;
    const db = drizzle(c.env.DB);
    const pend = await (db.select().from(table).where(eq(table.status, "pending-disable")).limit(1) as unknown as Promise<any[]>);
    const row = pend[0];
    if (!row) return c.json({ error: "Not found" }, 404);
    const upd2 = await (db.update(table).set({ status: "disabled", updatedAt: new Date().toISOString() }).where(eq(table.id, row.id)).returning() as unknown as Promise<any[]>);
    return c.json(upd2[0]);
  });
}

spotlightRoutes(app, "spotlight", studentSpotlightTable);
spotlightRoutes(app, "business-spotlight", businessSpotlightTable);
spotlightRoutes(app, "group-spotlight", groupSpotlightTable);

// ─── Admin ────────────────────────────────────────────────────────────────────
app.get("/api/admin/me", async (c) => {
  const token = getCookie(c, "session");
  if (!token) return c.json({ error: "Unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await verifyJWT(token, c.env.JWT_SECRET);
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userId = payload.sub as string;
  const db = drizzle(c.env.DB);
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  return c.json({
    userId,
    name: payload.name ?? null,
    email: payload.email ?? null,
    picture: payload.picture ?? null,
    role: roleRow?.role ?? null,
    isAdmin: roleRow?.role === "admin",
    isApproved: !!roleRow,
  });
});

app.get("/api/admin/users", async (c) => {
  const auth = await requireAdmin(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const users = await db.select().from(userRolesTable);
  return c.json({
    users: users.map((u) => ({
      clerkUserId: u.userId,
      role: u.role,
      name: u.name,
      email: u.email,
      grantedAt: u.grantedAt,
    })),
  });
});

app.put("/api/admin/users/:clerkUserId/role", async (c) => {
  const auth = await requireAdmin(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const userId = c.req.param("clerkUserId");
  const { role } = await c.req.json();
  const existing = await db.select().from(userRolesTable).where(eq(userRolesTable.userId, userId));
  let result;
  if (existing.length > 0) {
    [result] = await db.update(userRolesTable).set({ role }).where(eq(userRolesTable.userId, userId)).returning();
  } else {
    [result] = await db.insert(userRolesTable).values({ userId, role }).returning();
  }
  return c.json(result);
});

app.delete("/api/admin/users/:clerkUserId/role", async (c) => {
  const auth = await requireAdmin(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const userId = c.req.param("clerkUserId");
  await db.delete(userRolesTable).where(eq(userRolesTable.userId, userId));
  return new Response(null, { status: 204 });
});

app.get("/api/admin/draft-count", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(articlesTable).where(eq(articlesTable.status, "draft"));
  return c.json({ count: Number(result?.count ?? 0) });
});

app.post("/api/admin/publish-edition", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const now = new Date().toISOString();
  const publishedArticles = await db.update(articlesTable)
    .set({ status: "published", updatedAt: now })
    .where(eq(articlesTable.status, "draft"))
    .returning({ id: articlesTable.id });
  return c.json({ published: publishedArticles.length });
});

// ─── Newsletter ───────────────────────────────────────────────────────────────
app.post("/api/newsletter/subscribe", async (c) => {
  const db = drizzle(c.env.DB);
  const { name, email } = await c.req.json();
  if (!name || !email) return c.json({ error: "name and email are required" }, 400);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return c.json({ error: "Invalid email address" }, 400);
  const existing = await db.select().from(newsletterSubscribersTable).where(eq(newsletterSubscribersTable.email, email.toLowerCase().trim())).limit(1);
  if (existing.length > 0) return c.json({ message: "Already subscribed", alreadySubscribed: true });
  const [subscriber] = await db.insert(newsletterSubscribersTable).values({ name: name.trim(), email: email.toLowerCase().trim() }).returning();
  return c.json({ message: "Subscribed successfully", subscriber }, 201);
});

app.get("/api/newsletter/subscribers", async (c) => {
  const auth = await requireAdmin(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const subscribers = await db.select().from(newsletterSubscribersTable).orderBy(asc(newsletterSubscribersTable.subscribedAt));
  return c.json({ subscribers });
});

app.post("/api/newsletter/send-edition", async (c) => {
  const auth = await requireAdmin(c);
  if (auth instanceof Response) return auth;
  if (!c.env.RESEND_API_KEY) return c.json({ error: "Email service not configured" }, 503);
  const db = drizzle(c.env.DB);
  const { subject, message } = await c.req.json();
  if (!subject) return c.json({ error: "subject is required" }, 400);
  const fromEmail = c.env.FROM_EMAIL || "The Front Porch Bulletin <onboarding@resend.dev>";
  const siteUrl = c.env.SITE_URL || "https://frontporchbulletin.com";
  const [subscribers, articles, featuredArticles] = await Promise.all([
    db.select().from(newsletterSubscribersTable),
    db.select().from(articlesTable).where(and(eq(articlesTable.archived, false), eq(articlesTable.featured, false))).orderBy(desc(articlesTable.publishedAt)).limit(5),
    db.select().from(articlesTable).where(and(eq(articlesTable.archived, false), eq(articlesTable.featured, true))).orderBy(desc(articlesTable.publishedAt)).limit(1),
  ]);
  const headline = featuredArticles[0] || articles[0];
  const secondary = headline ? articles.filter((a) => a.id !== headline.id).slice(0, 4) : articles.slice(0, 4);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const articleRows = secondary.map((a) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #ccc;"><p style="margin:0 0 2px 0;font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#1a1a1a;">${a.title}</p><p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;">By ${a.author} &bull; ${a.category}</p></td></tr>`
  ).join("");
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;"><tr><td align="center" style="padding:20px 10px;"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a1a;max-width:600px;width:100%;"><tr><td style="background:#f5f0e8;border-bottom:3px double #1a1a1a;padding:24px;text-align:center;"><p style="margin:0 0 4px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;">${today}</p><h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:bold;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;">The Front Porch Bulletin</h1></td></tr><tr><td style="background:#1a1a1a;padding:8px 24px;text-align:center;"><p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#f5f0e8;text-transform:uppercase;letter-spacing:2px;">${subject}</p></td></tr><tr><td style="padding:24px;">${message ? `<p style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1a1a1a;border-bottom:1px solid #ccc;padding-bottom:16px;margin-bottom:20px;">${message.replace(/\n/g, "<br>")}</p>` : ""}${headline ? `<h2 style="margin:12px 0 6px 0;font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#1a1a1a;">${headline.title}</h2><p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#333;">${headline.content.substring(0, 300)}...</p>` : ""}${secondary.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0">${articleRows}</table>` : ""}<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;"><tr><td align="center"><a href="${siteUrl}" style="display:inline-block;background:#1a1a1a;color:#f5f0e8;font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;text-decoration:none;">Read the Full Edition</a></td></tr></table></td></tr><tr><td style="background:#f5f0e8;border-top:2px solid #1a1a1a;padding:16px 24px;text-align:center;"><p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#bbb;">You're receiving this because you signed up at the Bulletin.</p></td></tr></table></td></tr></table></body></html>`;
  const resend = new Resend(c.env.RESEND_API_KEY);
  let sent = 0;
  await Promise.allSettled(subscribers.map(async (sub) => {
    try { await resend.emails.send({ from: fromEmail, to: sub.email, subject, html }); sent++; } catch {}
  }));
  return c.json({ sent, total: subscribers.length });
});

// ─── About ────────────────────────────────────────────────────────────────────
app.get("/api/about", async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db.select().from(aboutContentTable).limit(1);
  return c.json(row ?? { foundingYear: "1924", body: "", editorialStaff: "[]", officeLocation: "Main Street" });
});

app.put("/api/about", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const existing = await db.select().from(aboutContentTable).limit(1);
  if (existing.length > 0) {
    const [row] = await db.update(aboutContentTable).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(aboutContentTable.id, existing[0].id)).returning();
    return c.json(row);
  }
  const [row] = await db.insert(aboutContentTable).values(body).returning();
  return c.json(row, 201);
});

// ─── Issue Settings ───────────────────────────────────────────────────────────
app.get("/api/issue-settings", async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db.select().from(issueSettingsTable).limit(1);
  return c.json(row ?? { issueNumber: "01", issueYear: 2026, issueMonth: 5 });
});

app.put("/api/issue-settings", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const existing = await db.select().from(issueSettingsTable).limit(1);
  if (existing.length > 0) {
    const [row] = await db.update(issueSettingsTable).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(issueSettingsTable.id, existing[0].id)).returning();
    return c.json(row);
  }
  const [row] = await db.insert(issueSettingsTable).values(body).returning();
  return c.json(row, 201);
});

// ─── Comic ────────────────────────────────────────────────────────────────────
app.get("/api/comic", async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db.select().from(comicsTable).where(eq(comicsTable.status, "published")).limit(1);
  return c.json(row ?? null);
});

app.put("/api/comic", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const existing = await db.select().from(comicsTable).limit(1);
  if (existing.length > 0) {
    const [row] = await db.update(comicsTable).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(comicsTable.id, existing[0].id)).returning();
    return c.json(row);
  }
  const [row] = await db.insert(comicsTable).values(body).returning();
  return c.json(row, 201);
});

// ─── Puzzles ──────────────────────────────────────────────────────────────────
app.get("/api/puzzles", async (c) => {
  const db = drizzle(c.env.DB);
  const [row] = await db.select().from(puzzlesTable).where(eq(puzzlesTable.status, "published")).limit(1);
  return c.json(row ?? null);
});

app.put("/api/puzzles", async (c) => {
  const auth = await requireApproved(c);
  if (auth instanceof Response) return auth;
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const existing = await db.select().from(puzzlesTable).limit(1);
  if (existing.length > 0) {
    const [row] = await db.update(puzzlesTable).set({ ...body, updatedAt: new Date().toISOString() }).where(eq(puzzlesTable.id, existing[0].id)).returning();
    return c.json(row);
  }
  const [row] = await db.insert(puzzlesTable).values(body).returning();
  return c.json(row, 201);
});

// ─── Letter to Editor ─────────────────────────────────────────────────────────
app.post("/api/letter-to-editor", async (c) => {
  if (!c.env.RESEND_API_KEY) return c.json({ error: "Email service not configured" }, 503);
  const { name, email, message } = await c.req.json();
  if (!name || !email || !message) return c.json({ error: "name, email, and message are required" }, 400);
  const resend = new Resend(c.env.RESEND_API_KEY);
  const fromEmail = c.env.FROM_EMAIL || "The Front Porch Bulletin <onboarding@resend.dev>";
  await resend.emails.send({
    from: fromEmail,
    to: "TheFrontPorchBulletin@gmail.com",
    subject: `Letter to the Editor from ${name}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });
  return c.json({ message: "Letter submitted successfully" });
});

// ─── Donate ───────────────────────────────────────────────────────────────────
app.get("/api/donate/config", (c) => c.json({ amounts: [5, 10, 25, 50, 100], currency: "usd" }));

app.post("/api/donate/create-session", async (c) => {
  if (!c.env.STRIPE_SECRET_KEY) return c.json({ error: "Stripe not configured" }, 503);
  const { amount } = await c.req.json();
  if (!amount || typeof amount !== "number") return c.json({ error: "amount is required" }, 400);
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);
  const siteUrl = c.env.SITE_URL || "https://frontporchbulletin.com";
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: { currency: "usd", product_data: { name: "Donation to The Front Porch Bulletin" }, unit_amount: amount * 100 }, quantity: 1 }],
    mode: "payment",
    success_url: `${siteUrl}/donate?success=true`,
    cancel_url: `${siteUrl}/donate?cancelled=true`,
  });
  return c.json({ url: session.url });
});

// ─── Storage ──────────────────────────────────────────────────────────────────
app.post("/api/storage/uploads/request-url", async (c) => {
  const { filename, contentType } = await c.req.json();
  if (!filename || !contentType) return c.json({ error: "filename and contentType are required" }, 400);
  const key = `uploads/${crypto.randomUUID()}-${filename}`;
  return c.json({ uploadUrl: `/api/storage/upload/${encodeURIComponent(key)}`, publicUrl: `/api/storage/public-objects/${key}`, key });
});

app.put("/api/storage/upload/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const body = await c.req.arrayBuffer();
  const contentType = c.req.header("Content-Type") ?? "application/octet-stream";
  await c.env.STORAGE.put(key, body, { httpMetadata: { contentType } });
  return c.json({ key, publicUrl: `/api/storage/public-objects/${key}` });
});

app.get("/api/storage/public-objects/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const obj = await c.env.STORAGE.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  return new Response(obj.body, {
    headers: { "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000" },
  });
});

app.get("/api/storage/objects/:path{.+}", async (c) => {
  const key = c.req.param("path");
  const obj = await c.env.STORAGE.get(key);
  if (!obj) return c.json({ error: "Not found" }, 404);
  return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream" } });
});

export default app;
