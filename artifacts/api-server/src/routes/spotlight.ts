import { Router } from "express";
import { db, spotlightTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireApproved, checkIsApprovedStaff } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const isStaff = await checkIsApprovedStaff(req);

  if (isStaff) {
    const [draft] = await db
      .select()
      .from(spotlightTable)
      .where(eq(spotlightTable.status, "draft"))
      .orderBy(desc(spotlightTable.updatedAt))
      .limit(1);

    if (draft) {
      res.json(draft);
      return;
    }
  }

  const [published] = await db
    .select()
    .from(spotlightTable)
    .where(eq(spotlightTable.status, "published"))
    .orderBy(desc(spotlightTable.updatedAt))
    .limit(1);

  if (!published) {
    res.status(404).json({ error: "No spotlight set" });
    return;
  }

  res.json(published);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, school, grade, description, photoUrl, photoCredit, photos } = req.body;
  if (!name || !school || !grade || !description) {
    res.status(400).json({ error: "name, school, grade, and description are required" });
    return;
  }

  const syncedPhotoUrl = photos && photos.length > 0 ? photos[0].url : (photoUrl ?? null);
  const syncedPhotoCredit = photos && photos.length > 0 ? (photos[0].credit || null) : (photoCredit ?? null);

  const [existingDraft] = await db
    .select()
    .from(spotlightTable)
    .where(eq(spotlightTable.status, "draft"))
    .orderBy(desc(spotlightTable.updatedAt))
    .limit(1);

  if (existingDraft) {
    const [updated] = await db
      .update(spotlightTable)
      .set({ name, school, grade, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, updatedAt: new Date() })
      .where(eq(spotlightTable.id, existingDraft.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(spotlightTable)
      .values({ name, school, grade, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, status: "draft" })
      .returning();
    res.json(created);
  }
});

export default router;
