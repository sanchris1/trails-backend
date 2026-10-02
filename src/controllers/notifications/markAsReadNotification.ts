import { Request, Response } from "express";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function markAsReadNotification(req: Request, res: Response) {
  try {
    const { notificationId } = req.params;

    if (!notificationId || typeof notificationId !== "string")
      return res.status(402).json({
        success: false,
        message: "NotificationId not passed",
      });

    const [isNotification] = await db
      .update(notification)
      .set({ isRead: true })
      .where(eq(notification.id, notificationId))
      .returning();

    if (!isNotification)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });

    return res.status(200).json({
      success: true,
      message: "Updated",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
