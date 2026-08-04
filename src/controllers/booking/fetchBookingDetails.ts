import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchBookingDetails(req: Request, res: Response) {
  try {
    const { bookingId } = req.params as { bookingId: string };

    const bookingDetails = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .innerJoin(expedition, eq(expedition.id, bookings.expeditionId))
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
      .limit(1);

    if (bookingDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking details not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bookingDetails[0],
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
