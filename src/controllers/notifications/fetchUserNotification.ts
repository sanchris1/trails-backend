import { Request, Response } from "express";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";
import { eq, or } from "drizzle-orm";

export async function fetchUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const results = await db
      .select()
      .from(notification)
      .where(
        or(
          eq(notification.senderId, userId),
          eq(notification.recipientId, userId),
        ),
      );

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
