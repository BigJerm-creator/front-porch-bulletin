import { Router } from "express";
import { db, churchesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireApproved } from "../middlewares/auth";

const router = Router();

router.get("/", async (_req, res) => {
  const churches = await db
    .select()
    .from(churchesTable)
    .orderBy(asc(churchesTable.sortOrder), asc(churchesTable.createdAt));

  res.json({ churches });
});

router.post("/", requireApproved, async (req, res) => {
  const { name, address, pastor, serviceTimes, phone, sortOrder } = req.body;
  if (!name || !address || !pastor || !serviceTimes || !phone) {
    res.status(400).json({ error: "name, address, pastor, serviceTimes, and phone are required" });
    return;
  }

  const [church] = await db
    .insert(churchesTable)
    .values({ name, address, pastor, serviceTimes, phone, sortOrder: sortOrder ?? 0 })
    .returning();
  res.status(201).json(church);
});

router.put("/:id", requireApproved, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { name, address, pastor, serviceTimes, phone, sortOrder } = req.body;
  if (!name || !address || !pastor || !serviceTimes || !phone) {
    res.status(400).json({ error: "name, address, pastor, serviceTimes, and phone are required" });
    return;
  }

  const [church] = await db
    .update(churchesTable)
    .set({ name, address, pastor, serviceTimes, phone, sortOrder: sortOrder ?? 0 })
    .where(eq(churchesTable.id, id))
    .returning();

  if (!church) {
    res.status(404).json({ error: "Church not found" });
    return;
  }

  res.json(church);
});

router.delete("/:id", requireApproved, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(churchesTable).where(eq(churchesTable.id, id));
  res.status(204).send();
});

export default router;
