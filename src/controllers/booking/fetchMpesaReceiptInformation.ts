import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookings, mpesaReceipt, notification } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import { getAdminId } from "../auth/fetchAdminId.js";

export async function fetchUserMpesaReceiptNumber(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const adminId = await getAdminId();

    if (adminId === "") {
      return res
        .status(400)
        .json({ success: false, message: "Admin Id not found" });
    }

    const { bookingId, receiptNumber } = req.body as {
      bookingId: string;
      receiptNumber: string;
    };

    if (userId === "") {
      return res.status(400).json({ success: false, message: "Authenticate" });
    }

    if (!receiptNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please be sure to include the receipt number",
      });
    }

    const [bookingExists] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
      .limit(1);

    if (!bookingExists) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(mpesaReceipt)
        .values({ userId, bookingId, receiptNumber });

      await tx.insert(notification).values({
        recipientId: adminId,
        senderId: userId,
        type: "payment_reminder",
        title: "User sent Receipt",
        message:
          "User has shared some payment receipt. Please confirm the payment.",
      });
    });

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Receipt sent successfully. Wait for the confirmation by the admins",
      });
  } catch (error) {
    console.error("Error fetching the user receipt data");

    return res.status(500).json({
      success: true,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
