import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  adventure,
  bookings,
  expedition,
  notification,
  user,
} from "../../db/schema.js";
import { and, eq, ne, sql } from "drizzle-orm";

export async function bookExpedition(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const { expeditionId } = req.params as { expeditionId: string };
    const { numberOfParticipants } = req.body;

    if (!userId) {
      return res.status(404).json({
        success: false,
        message: "User Id needed",
      });
    }

    const isUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (isUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.expeditionId, expeditionId),
        ),
      );

    if (existingBooking.length > 0) {
      if (existingBooking[0].bookingStatus !== "cancelled") {
        return res.status(409).json({
          success: false,
          message: "You already have an active booking for this expedition",
        });
      } else {
        await db
          .delete(bookings)
          .where(
            and(
              eq(bookings.userId, userId),
              eq(bookings.expeditionId, expeditionId),
            ),
          );
      }
    }

    const expeditionDetails = await db
      .select()
      .from(expedition)
      .where(eq(expedition.id, expeditionId))
      .innerJoin(adventure, eq(adventure.id, expedition.adventureId))
      .limit(1);

    if (!expeditionDetails || expeditionDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found",
      });
    }

    const numP = numberOfParticipants ?? 1;
    const price = expeditionDetails.at(0)?.adventure.defaultPrice!;

    const [{ booked }] = await db
      .select({
        booked: sql<number>`COALESCE(SUM(${bookings.numberOfParticipants}),0)`,
      })
      .from(bookings)
      .where(eq(bookings.expeditionId, expeditionId));

    const slotsLeft = expeditionDetails[0].adventure.defaultCapacity - booked;

    if (numP > slotsLeft) {
      return res.status(400).json({
        success: false,
        message: `Only ${slotsLeft} slot(s) are available`,
      });
    }

    //creating the new booking
    const newBooking = await db
      .insert(bookings)
      .values({
        userId,
        expeditionId,
        numberOfParticipants: numP,
        totalAmount: price * numP,
      })
      .returning();

    await db.insert(notification).values({
      userId,
      title: "New booking created",
      message: `User of name:${isUser.at(0)?.name}
       and email:${isUser.at(0)?.email} has created a booking with 
       ${numP} participants.`,
      type: "bookings-created",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
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
