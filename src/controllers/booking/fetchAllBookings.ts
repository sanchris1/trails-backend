import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchAllBookings(_req: Request, res: Response) {
  try {
    const allBookings = await db
      .select()
      .from(bookings)
      .innerJoin(expedition, eq(bookings.expeditionId, expedition.id))
      .innerJoin(adventure, eq(adventure.id, expedition.adventureId));

    if (allBookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      data: allBookings,
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
