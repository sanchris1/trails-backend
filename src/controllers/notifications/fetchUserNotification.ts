import { Request, Response } from "express";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";
import { and, eq, ne } from "drizzle-orm";
import { getAdminId } from "../auth/fetchAdminId.js";

export async function fetchUserNotifications(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const adminId = await getAdminId();

    const results = await db
      .select()
      .from(notification)
      .where(
        and(
          eq(notification.senderId, userId),
          eq(notification.recipientId, userId),
          ne(notification.recipientId, adminId),
        ),
      );

    return res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
