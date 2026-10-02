import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  adventure,
  bookingParticipants,
  bookings,
  expedition,
  notification,
  user,
} from "../../db/schema.js";
import { getAdminId } from "../auth/fetchAdminId.js";
import { and, eq, ne, sum } from "drizzle-orm";

interface BookingData {
  expeditionId: string;
  bookingStatus: "pending" | "cancelled" | "confirmed";
  numberOfParticipants: number;
  paymentStatus: "pending" | "partially_paid" | "paid" | "failed" | "refunded";
  totalAmount: number;
}

interface BookParticipantsData {
  fullName: string;
  email: string;
  phone: string;
  medicalNotes: string;
  emergencyContact: string;
}

interface BookExpeditionsRequestData {
  bookings: BookingData;
  bookingParticipants: BookParticipantsData[];
}

export async function bookExpedition(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const adminId = await getAdminId();

    if (adminId === "") {
      return res
        .status(400)
        .json({ success: false, message: "Admin Id not found" });
    }

    const data = req.body as BookExpeditionsRequestData;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Authenticate!!" });
    }

    if (!data.bookings) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the booking data",
      });
    }

    if (
      !data.bookingParticipants ||
      data.bookingParticipants.length === 0 ||
      !Array.isArray(data.bookingParticipants)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please pass the participants. Should be more than one",
      });
    }

    const result = await db.transaction(async (tx) => {
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          userId,
          expeditionId: data.bookings.expeditionId,
          bookingStatus: data.bookings.bookingStatus,
          numberOfParticipants: data.bookings.numberOfParticipants,
          paymentStatus: data.bookings.paymentStatus,
          totalAmount: data.bookings.totalAmount,
        })
        .returning({ bookingId: bookings.id });

      const [userName] = await tx
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      await tx.insert(notification).values({
        recipientId: adminId,
        senderId: userId,
        type: "booking_created",
        title: "Booking created.",
        message: `${userName.name.toUpperCase()} has created a new booking with ${data.bookingParticipants.length} booked participants .`,
      });

      //check if the remaining slots are the same with the participants

      const [expeditionWithAdventure] = await tx
        .select({ maximumCapacity: adventure.defaultCapacity })
        .from(expedition)
        .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
        .where(eq(expedition.id, data.bookings.expeditionId))
        .limit(1);

      if (!expeditionWithAdventure) {
        tx.rollback();
        return res.status(404).json({
          success: false,
          message: "Expedition or adventure not found",
        });
      }

      const [bookedData] = await tx
        .select({ totalBooked: sum(bookings.numberOfParticipants) })
        .from(bookings)
        .where(
          and(
            eq(bookings.expeditionId, data.bookings.expeditionId),
            ne(bookings.bookingStatus, "cancelled"),
          ),
        );

      const currentBookedCount = Number(bookedData?.totalBooked || 0);
      const slotsLeft =
        expeditionWithAdventure.maximumCapacity - currentBookedCount;

      if (slotsLeft < data.bookingParticipants.length) {
        tx.rollback();
        return res.status(400).json({
          success: false,
          message: `For the expedition only ${slotsLeft} slots are left.`,
        });
      }

      const participantsToInsert = data.bookingParticipants.map(
        (participant) => ({
          bookingId: newBooking.bookingId,
          fullName: participant.fullName,
          email: participant.email,
          phone: participant.phone,
          medicalNotes: participant.medicalNotes,
          emergencyContact: participant.emergencyContact,
        }),
      );

      await tx.insert(bookingParticipants).values(participantsToInsert);

      return newBooking;
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      result,
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
