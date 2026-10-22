import { Request, Response } from "express";
import { user } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";

export async function deleteAccount(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const [userExists] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await db.delete(user).where(eq(user.id, userId));

    return res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user account:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
