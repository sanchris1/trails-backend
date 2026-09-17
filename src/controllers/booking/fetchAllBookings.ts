import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  adventure,
  bookingParticipants,
  bookings,
  expedition,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchAllBookings(_req: Request, res: Response) {
  try {
    const allBookings = await db
      .select({
        bookingId: bookings.id,
        title: expedition.expeditionTitle,
        location: adventure.location,
        departureDate: expedition.departureDate,
        bookingStatus: bookings.bookingStatus,
        paymentStatus: bookings.paymentStatus,
        totalSlots: adventure.defaultCapacity,
        numberOfParticipants: bookings.numberOfParticipants,
      })
      .from(bookings)
      .innerJoin(expedition, eq(bookings.expeditionId, expedition.id))
      .innerJoin(adventure, eq(adventure.id, expedition.adventureId));

    if (allBookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    const bookingsWithParticipants = await Promise.all(
      allBookings.map(async (booking) => {
        const participants = await db
          .select()
          .from(bookingParticipants)
          .where(eq(bookingParticipants.bookingId, booking.bookingId));

        return {
          ...booking,
          slotsLeft: booking.numberOfParticipants
            ? booking.totalSlots - booking.numberOfParticipants
            : 0,
          participants,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      bookingsWithParticipants,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error
        ? error.message
        : "Something happened when fetching bookings";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}
