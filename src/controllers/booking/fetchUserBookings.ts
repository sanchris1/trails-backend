import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchUserBookings(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Please provide the userID",
      });
    }

    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId));

    if (userBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      data: userBookings,
    });
  } catch (error) {
    console.log(error);

    const message =
      error instanceof Error
        ? error.message
        : "Something happened when booking";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}
