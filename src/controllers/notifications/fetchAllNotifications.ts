import { Request, Response } from "express";
import { db } from "../../index.js";
import { notification } from "../../db/schema.js";
import { desc } from "drizzle-orm";

export async function fetchAllNotifications(req: Request, res: Response) {
  try {
    const result = await db
      .select()
      .from(notification)
      .orderBy(desc(notification.createdAt));

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
