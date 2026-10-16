import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchUserBookings(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Please provide the userID",
      });
    }

    const userBookings = await db
      .select({
        expeditionId: expedition.id,
        location: adventure.location,
        paymentStatus: bookings.paymentStatus,
        departureDate: expedition.departureDate,
        returnDate: expedition.returnDate,
        bookingStatus: bookings.bookingStatus,
        numberOfParticipants: bookings.numberOfParticipants,
        bookingId: bookings.id,
        amountPaid: bookings.amountPaid,
        totalAmount: bookings.totalAmount,
        expeditionTitle: expedition.expeditionTitle,
      })
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .leftJoin(expedition, eq(bookings.expeditionId, expedition.id))
      .leftJoin(adventure, eq(expedition.adventureId, adventure.id));

    if (userBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      userBookings,
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
