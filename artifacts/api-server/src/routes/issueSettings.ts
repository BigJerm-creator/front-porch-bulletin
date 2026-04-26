import { Router } from "express";
import { db, issueSettingsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

const DEFAULTS = { issueNumber: "01", issueYear: 2026, issueMonth: 5 };

router.get("/", async (_req, res) => {
  const [row] = await db
    .select()
    .from(issueSettingsTable)
    .orderBy(desc(issueSettingsTable.updatedAt))
    .limit(1);

  res.json(row ?? DEFAULTS);
});

router.put("/", requireApproved, async (req, res) => {
  const { issueNumber, issueYear, issueMonth } = req.body;

  if (!issueNumber || !issueYear || !issueMonth) {
    res.status(400).json({ error: "issueNumber, issueYear, and issueMonth are required" });
    return;
  }

  const existing = await db
    .select()
    .from(issueSettingsTable)
    .orderBy(desc(issueSettingsTable.updatedAt))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(issueSettingsTable)
      .set({
        issueNumber: String(issueNumber),
        issueYear: Number(issueYear),
        issueMonth: Number(issueMonth),
        updatedAt: new Date(),
      })
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(issueSettingsTable)
      .values({
        issueNumber: String(issueNumber),
        issueYear: Number(issueYear),
        issueMonth: Number(issueMonth),
      })
      .returning();
    res.json(created);
  }
});

export default router;
