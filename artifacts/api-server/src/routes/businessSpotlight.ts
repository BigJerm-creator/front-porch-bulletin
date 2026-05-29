import { Router } from "express";
import { db, businessSpotlightTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireApproved, checkIsApprovedStaff } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const isStaff = await checkIsApprovedStaff(req);

  if (isStaff) {
    const [draft] = await db
      .select()
      .from(businessSpotlightTable)
      .where(eq(businessSpotlightTable.status, "draft"))
      .orderBy(desc(businessSpotlightTable.updatedAt))
      .limit(1);

    if (draft) {
      res.json(draft);
      return;
    }
  }

  const [published] = await db
    .select()
    .from(businessSpotlightTable)
    .where(eq(businessSpotlightTable.status, "published"))
    .orderBy(desc(businessSpotlightTable.updatedAt))
    .limit(1);

  if (!published) {
    res.status(404).json({ error: "No business spotlight set" });
    return;
  }

  res.json(published);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, businessType, description, photoUrl, photoCredit, photos } = req.body;
  if (!name || !businessType || !description) {
    res.status(400).json({ error: "name, businessType, and description are required" });
    return;
  }

  const syncedPhotoUrl = photos && photos.length > 0 ? photos[0].url : (photoUrl ?? null);
  const syncedPhotoCredit = photos && photos.length > 0 ? (photos[0].credit || null) : (photoCredit ?? null);

  const [existingDraft] = await db
    .select()
    .from(businessSpotlightTable)
    .where(eq(businessSpotlightTable.status, "draft"))
    .orderBy(desc(businessSpotlightTable.updatedAt))
    .limit(1);

  if (existingDraft) {
    const [updated] = await db
      .update(businessSpotlightTable)
      .set({ name, businessType, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, updatedAt: new Date() })
      .where(eq(businessSpotlightTable.id, existingDraft.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(businessSpotlightTable)
      .values({ name, businessType, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, status: "draft" })
      .returning();
    res.json(created);
  }
});

export default router;
