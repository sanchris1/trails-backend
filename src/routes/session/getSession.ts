import { Request, Response } from "express";
import { db } from "../../index.js";
import { user } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function getSession(req: Request, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Access token is missing or invalid",
      });
    }

    const [foundUser] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, req.userId))
      .limit(1);

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true, user: foundUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
