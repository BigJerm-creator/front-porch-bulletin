import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable, articlesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { Resend } from "resend";

const router = Router();

router.post("/subscribe", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const existing = await db
    .select()
    .from(newsletterSubscribersTable)
    .where(eq(newsletterSubscribersTable.email, email.toLowerCase().trim()))
    .limit(1);

  if (existing.length > 0) {
    res.status(200).json({ message: "Already subscribed", alreadySubscribed: true });
    return;
  }

  const [subscriber] = await db
    .insert(newsletterSubscribersTable)
    .values({ name: name.trim(), email: email.toLowerCase().trim() })
    .returning();

  res.status(201).json({ message: "Subscribed successfully", subscriber });
});

router.get("/subscribers", requireAdmin, async (_req, res) => {
  const subscribers = await db
    .select()
    .from(newsletterSubscribersTable)
    .orderBy(newsletterSubscribersTable.subscribedAt);
  res.json({ subscribers });
});

router.post("/send-edition", requireAdmin, async (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Email service not configured. Please add RESEND_API_KEY to environment secrets." });
    return;
  }

  const { subject, message } = req.body;
  if (!subject) {
    res.status(400).json({ error: "subject is required" });
    return;
  }

  const fromEmail = process.env.FROM_EMAIL || "The Front Porch Bulletin <onboarding@resend.dev>";
  const siteUrl = process.env.SITE_URL || "https://your-site.replit.app";

  const [subscribers, articles] = await Promise.all([
    db.select().from(newsletterSubscribersTable).orderBy(newsletterSubscribersTable.subscribedAt),
    db
      .select()
      .from(articlesTable)
      .where(and(eq(articlesTable.archived, false), eq(articlesTable.featured, false)))
      .orderBy(desc(articlesTable.publishedAt))
      .limit(5),
  ]);

  const featuredArticles = await db
    .select()
    .from(articlesTable)
    .where(and(eq(articlesTable.archived, false), eq(articlesTable.featured, true)))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(1);

  const headline = featuredArticles[0] || articles[0];
  const secondary = headline ? articles.filter((a) => a.id !== headline.id).slice(0, 4) : articles.slice(0, 4);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const articleRows = secondary
    .map(
      (a) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #ccc;">
          <p style="margin:0 0 2px 0; font-family:Georgia,serif; font-size:14px; font-weight:bold; color:#1a1a1a;">${a.title}</p>
          ${a.subtitle ? `<p style="margin:0; font-family:Georgia,serif; font-size:12px; color:#666; font-style:italic;">${a.subtitle}</p>` : ""}
          <p style="margin:4px 0 0 0; font-family:'Courier New',monospace; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px;">By ${a.author} &bull; ${a.category}</p>
        </td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a1a;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#f5f0e8;border-bottom:3px double #1a1a1a;padding:24px;text-align:center;">
          <p style="margin:0 0 4px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;">${today}</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:bold;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;">The Front Porch Bulletin</h1>
          <p style="margin:4px 0 0 0;font-family:Georgia,serif;font-size:12px;color:#666;font-style:italic;">Where Community Comes to Gather</p>
        </td></tr>

        <!-- Subject bar -->
        <tr><td style="background:#1a1a1a;padding:8px 24px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#f5f0e8;text-transform:uppercase;letter-spacing:2px;">${subject}</p>
        </td></tr>

        <tr><td style="padding:24px;">

          ${message ? `
          <!-- Intro message -->
          <p style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1a1a1a;border-bottom:1px solid #ccc;padding-bottom:16px;margin-bottom:20px;">${message.replace(/\n/g, "<br>")}</p>
          ` : ""}

          ${headline ? `
          <!-- Featured Story -->
          <p style="margin:0 0 8px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #1a1a1a;padding-bottom:6px;">This Week's Headline</p>
          <h2 style="margin:12px 0 6px 0;font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#1a1a1a;line-height:1.3;">${headline.title}</h2>
          ${headline.subtitle ? `<p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:15px;color:#555;font-style:italic;">${headline.subtitle}</p>` : ""}
          <p style="margin:0 0 16px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">By ${headline.author} &bull; ${headline.category}</p>
          <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:14px;line-height:1.7;color:#333;">${headline.content.substring(0, 300)}${headline.content.length > 300 ? "..." : ""}</p>
          ` : ""}

          ${secondary.length > 0 ? `
          <!-- More Stories -->
          <p style="margin:20px 0 8px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid #1a1a1a;padding-bottom:6px;">More from This Edition</p>
          <table width="100%" cellpadding="0" cellspacing="0">${articleRows}</table>
          ` : ""}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr><td align="center">
              <a href="${siteUrl}" style="display:inline-block;background:#1a1a1a;color:#f5f0e8;font-family:'Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:2px;padding:14px 32px;text-decoration:none;">Read the Full Edition</a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f5f0e8;border-top:2px solid #1a1a1a;padding:16px 24px;text-align:center;">
          <p style="margin:0 0 4px 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;">The Front Porch Bulletin &mdash; Your Community Paper</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#bbb;">You're receiving this because you signed up at the Bulletin. Reply to unsubscribe.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(apiKey);
  let sent = 0;

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: sub.email,
          subject,
          html,
        });
        sent++;
      } catch {
        // count failure silently
      }
    })
  );

  res.json({ sent, total: subscribers.length });
});

export default router;
