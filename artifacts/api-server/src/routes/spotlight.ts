import { Router } from "express";
import { db, spotlightTable } from "@workspace/db";
import { desc, eq, ne } from "drizzle-orm";
import { requireApproved, checkIsApprovedStaff } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const isStaff = await checkIsApprovedStaff(req);

  if (isStaff) {
    const [latest] = await db
      .select()
      .from(spotlightTable)
      .orderBy(desc(spotlightTable.updatedAt))
      .limit(1);
    if (latest) {
      res.json(latest);
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

  const [existing] = await db
    .select()
    .from(spotlightTable)
    .where(ne(spotlightTable.status, "disabled"))
    .orderBy(desc(spotlightTable.updatedAt))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(spotlightTable)
      .set({ name, school, grade, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, updatedAt: new Date() })
      .where(eq(spotlightTable.id, existing.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(spotlightTable)
      .values({ name, school, grade, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, status: "published" })
      .returning();
    res.json(created);
  }
});

router.patch("/", requireApproved, async (req, res) => {
  const [latest] = await db
    .select()
    .from(spotlightTable)
    .orderBy(desc(spotlightTable.updatedAt))
    .limit(1);

  if (!latest) {
    res.status(404).json({ error: "No spotlight found" });
    return;
  }

  const newStatus = latest.status === "disabled" ? "published" : "disabled";
  const [updated] = await db
    .update(spotlightTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(spotlightTable.id, latest.id))
    .returning();

  res.json(updated);
});

export default router;
