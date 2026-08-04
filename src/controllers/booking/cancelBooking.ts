import { Request, Response } from "express";
import {
  bookingParticipants,
  bookings,
  notification,
} from "../../db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../index.js";

export async function cancelBooking(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;

    const { bookingId } = req.params as {
      bookingId: string;
    };

    const { action = "one" } = req.body as { action: string };

    const whatAction = action ?? "one";

    const bookingExist = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (bookingExist.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    //you can choose to cancel 1 participant or all

    const bookedParticipantsNumber = bookingExist[0].numberOfParticipants;

    let message;

    if (bookedParticipantsNumber === 1) {
      await db
        .update(bookings)
        .set({ bookingStatus: "cancelled", numberOfParticipants: 0 })
        .where(eq(bookings.id, bookingId));

      message = "Booking cancelled successfully";
    } else {
      if (whatAction === "one") {
        const { removedParticipantEmail } = req.body as {
          removedParticipantEmail: string;
        };

        const isBookedParticipant = await db
          .select()
          .from(bookingParticipants)
          .where(eq(bookingParticipants.email, removedParticipantEmail))
          .limit(1);

        if (isBookedParticipant.length === 0) {
          return res.status(404).json({
            success: false,
            message: "The email does not belong to any booked person",
          });
        }

        await db
          .update(bookings)
          .set({
            numberOfParticipants: sql`${bookings.numberOfParticipants}-1`,
          })
          .where(eq(bookings.id, bookingId));

        await db
          .delete(bookingParticipants)
          .where(
            and(
              eq(bookingParticipants.bookingId, bookingId),
              eq(bookingParticipants.email, removedParticipantEmail),
            ),
          );

        message = "One participant's booking cancelled";
      } else {
        await db
          .update(bookings)
          .set({ bookingStatus: "cancelled", numberOfParticipants: 0 })
          .where(eq(bookings.id, bookingId));

        await db
          .delete(bookingParticipants)
          .where(eq(bookingParticipants.bookingId, bookingId));

        message = "All the participants have been deleted";
      }
    }

    await db.insert(notification).values({
      userId,
      title: "Cancelled Booking(s)",
      message,
      type: "cancelled_bo0king",
    });

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error: any) {
    console.log(error);

    const message =
      error.code === "23505"
        ? "Duplicate emails found"
        : error instanceof Error
          ? error.message
          : "Something happened when booking";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}
