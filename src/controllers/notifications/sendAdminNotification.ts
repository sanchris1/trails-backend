import { Request, Response } from "express";
import { getAdminId } from "../auth/fetchAdminId.js";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";

export async function sendAdminNotification(req: Request, res: Response) {
  try {
    const adminId = await getAdminId();

    const userId = req.userId;

    const { title, message } = req.body;

    await db.insert(notification).values({
      title,
      message,
      recipientId: adminId,
      senderId: userId,
      type: "inquiry",
    });

    return res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
