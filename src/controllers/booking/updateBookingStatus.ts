import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookings } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

type StatusTypes =
  | "pending"
  | "partially_paid"
  | "paid"
  | "failed"
  | "refunded";

const validStatuses: StatusTypes[] = [
  "pending",
  "partially_paid",
  "paid",
  "failed",
  "refunded",
];

export async function updateBookingStatus(req: Request, res: Response) {
  try {
    const { status } = req.body as {
      status: StatusTypes;
    };

    const { amountPaid } = req.query as {
      amountPaid: string;
    };

    const { bookingId } = req.params as { bookingId: string };

    if (
      typeof status !== "string" ||
      !validStatuses.includes(status as StatusTypes)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please add the correct status" });
    }

    await db.transaction(async (tx) => {
      const [bookingExists] = await tx
        .select({
          expeditionId: bookings.expeditionId,
          totalAMount: bookings.totalAmount,
        })
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!bookingExists) {
        return res
          .status(404)
          .json({ success: true, message: "The booking is not found" });
      }

      await tx
        .update(bookings)
        .set({
          bookingStatus:
            status === "partially_paid" || "paid"
              ? "confirmed"
              : status === "refunded"
                ? "cancelled"
                : "pending",
          amountPaid: status === "partially_paid" ? Number(amountPaid) : 0,
          paymentStatus:
            Number(amountPaid) === bookingExists.totalAMount ? "paid" : status,
        })
        .where(
          and(
            eq(bookings.id, bookingId),
            eq(bookings.expeditionId, bookingExists.expeditionId),
          ),
        );
    });

    return res
      .status(200)
      .json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    (console.error("Error updating the status:", error),
      res
        .status(500)
        .json({ success: false, message: "Internal server error" }));
  }
}
