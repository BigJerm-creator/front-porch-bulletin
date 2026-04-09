import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

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

export default router;
