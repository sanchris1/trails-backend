import { Request, Response } from "express";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function deleteNotification(req: Request, res: Response) {
  try {
    const { notificationId } = req.params as { notificationId: string };

    if (!notificationId)
      return res
        .status(402)
        .json({ success: false, message: "Please pass the notification id" });

    const [isNotification] = await db
      .delete(notification)
      .where(eq(notification.id, notificationId))
      .returning();

    if (!isNotification)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });

    res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
