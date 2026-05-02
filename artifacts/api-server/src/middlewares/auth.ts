import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, userRolesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthedRequest extends Request {
  clerkUserId?: string;
  userRole?: string | null;
}

export const requireAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = userId;
  next();
};

export const requireApproved = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = userId;

  const [roleRow] = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.clerkUserId, userId));

  if (!roleRow) {
    res.status(403).json({ error: "Your account is pending approval" });
    return;
  }
  req.userRole = roleRow.role;
  next();
};

export const checkIsApprovedStaff = async (req: Request): Promise<boolean> => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) return false;
  const [roleRow] = await db.select().from(userRolesTable).where(eq(userRolesTable.clerkUserId, userId));
  return !!roleRow;
};

export const requireAdmin = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = userId;

  const [roleRow] = await db
    .select()
    .from(userRolesTable)
    .where(eq(userRolesTable.clerkUserId, userId));

  if (!roleRow || roleRow.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  req.userRole = roleRow.role;
  next();
};
