import { NextFunction, Request, Response } from "express";
import { db } from "../index.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function requireRole(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Please authenticate",
      });
    }

    const [foundUser] = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, req.userId))
      .limit(1);

    if (!foundUser || foundUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden. Admin required to carry out this action",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
  next();
}
