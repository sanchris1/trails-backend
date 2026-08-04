import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookingParticipants, bookings } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function addBookingParticipants(req: Request, res: Response) {
  try {
    const { bookingId } = req.params as {
      bookingId: string;
    };

    const { participants } = req.body as any;

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

    const participantsRows = participants.map((participant: any) => ({
      bookingId,
      fullName: participant.fullName,
      email: participant.email,
      phone: participant.phone,
      medicalNotes: participant.medicalNotes,
      emergencyContact: participant.emergencyContact,
    }));

    await db.insert(bookingParticipants).values(participantsRows);

    return res.status(201).json({
      success: true,
      message: `${participants.length} participants created`,
    });
  } catch (error: any) {
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
