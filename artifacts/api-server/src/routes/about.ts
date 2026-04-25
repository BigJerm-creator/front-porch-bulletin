import { Router } from "express";
import { db, aboutContentTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

const DEFAULTS = {
  foundingYear: "1924",
  body: "Founded in 1924, The Front Porch Bulletin has been the steady heartbeat of our community for nearly a century. We believe that local news is the most important news. While the big city papers might carry stories from across the ocean, we bring you the stories from across the street.\n\nWhether it's the results of the high school football game, the announcement of a new local business, or the stories of those who built this town, we record the history of our home, week by week, edition by edition.\n\nIn an age of instant digital gratification, we preserve the dignity of the printed word. We take pride in our typesetting, our thorough fact-checking, and our commitment to serving you, the reader.\n\nWe are always looking for community contributions. If you have a story, a photograph, or a classified ad, please use our submission form or drop by the office on Main Street. The coffee is always on.",
  editorialStaff: JSON.stringify([
    { role: "Editor in Chief", name: "Margaret \"Peggy\" Vance" },
    { role: "Managing Editor", name: "Thomas Harrison" },
    { role: "Sports Desk", name: "Coach Bill Jenkins" },
    { role: "Typesetter", name: "Samuel Vance Jr." },
  ]),
  officeLocation: "Main Street",
};

router.get("/", async (_req, res) => {
  const [row] = await db
    .select()
    .from(aboutContentTable)
    .orderBy(desc(aboutContentTable.updatedAt))
    .limit(1);

  if (!row) {
    res.json(DEFAULTS);
    return;
  }

  res.json(row);
});

router.put("/", requireApproved, async (req, res) => {
  const { foundingYear, body, editorialStaff, officeLocation } = req.body;

  if (!body) {
    res.status(400).json({ error: "body is required" });
    return;
  }

  const staffStr = typeof editorialStaff === "string"
    ? editorialStaff
    : JSON.stringify(editorialStaff ?? []);

  const existing = await db
    .select()
    .from(aboutContentTable)
    .orderBy(desc(aboutContentTable.updatedAt))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(aboutContentTable)
      .set({
        foundingYear: foundingYear ?? "1924",
        body,
        editorialStaff: staffStr,
        officeLocation: officeLocation ?? "Main Street",
        updatedAt: new Date(),
      })
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(aboutContentTable)
      .values({
        foundingYear: foundingYear ?? "1924",
        body,
        editorialStaff: staffStr,
        officeLocation: officeLocation ?? "Main Street",
      })
      .returning();
    res.json(created);
  }
});

export default router;
