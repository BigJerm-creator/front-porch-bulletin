import { Router } from "express";
import { db, groupSpotlightTable } from "@workspace/db";
import { desc, eq, ne } from "drizzle-orm";
import { requireApproved, checkIsAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const isAdmin = await checkIsAdmin(req);

  if (isAdmin) {
    const [latest] = await db
      .select()
      .from(groupSpotlightTable)
      .orderBy(desc(groupSpotlightTable.updatedAt))
      .limit(1);
    if (latest) {
      res.json(latest);
      return;
    }
  }

  const [visible] = await db
    .select()
    .from(groupSpotlightTable)
    .where(ne(groupSpotlightTable.status, "disabled"))
    .orderBy(desc(groupSpotlightTable.updatedAt))
    .limit(1);

  if (!visible) {
    res.status(404).json({ error: "No group spotlight set" });
    return;
  }

  res.json(visible);
});

router.put("/", requireApproved, async (req, res) => {
  const { name, groupType, description, photoUrl, photoCredit, photos } = req.body;
  if (!name || !groupType || !description) {
    res.status(400).json({ error: "name, groupType, and description are required" });
    return;
  }

  const syncedPhotoUrl = photos && photos.length > 0 ? photos[0].url : (photoUrl ?? null);
  const syncedPhotoCredit = photos && photos.length > 0 ? (photos[0].credit || null) : (photoCredit ?? null);

  const [existing] = await db
    .select()
    .from(groupSpotlightTable)
    .where(ne(groupSpotlightTable.status, "disabled"))
    .orderBy(desc(groupSpotlightTable.updatedAt))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(groupSpotlightTable)
      .set({ name, groupType, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, updatedAt: new Date() })
      .where(eq(groupSpotlightTable.id, existing.id))
      .returning();
    res.json(updated);
  } else {
    const [created] = await db
      .insert(groupSpotlightTable)
      .values({ name, groupType, description, photoUrl: syncedPhotoUrl, photoCredit: syncedPhotoCredit, photos: photos ?? null, status: "published" })
      .returning();
    res.json(created);
  }
});

router.patch("/", requireApproved, async (req, res) => {
  const [latest] = await db
    .select()
    .from(groupSpotlightTable)
    .orderBy(desc(groupSpotlightTable.updatedAt))
    .limit(1);

  if (!latest) {
    res.status(404).json({ error: "No group spotlight found" });
    return;
  }

  const newStatus = latest.status === "disabled" ? "published" : "disabled";
  const [updated] = await db
    .update(groupSpotlightTable)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(groupSpotlightTable.id, latest.id))
    .returning();

  res.json(updated);
});

export default router;
