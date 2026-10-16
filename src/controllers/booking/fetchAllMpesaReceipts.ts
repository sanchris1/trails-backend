import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookings, expedition, mpesaReceipt, user } from "../../db/schema.js";
import { count, desc, eq, sql } from "drizzle-orm";

export async function fetchAllMpesaReceipts(req: Request, res: Response) {
  try {
    const result = await db.transaction(async (tx) => {
      const allReceipts = await tx
        .select({
          paymentReceiptId: mpesaReceipt.paymentId,
          id: mpesaReceipt.id,
          userName: user.name,
          userEmail: user.email,
          title: expedition.expeditionTitle,
          amount: bookings.totalAmount,
          status: bookings.paymentStatus,
          receiptNumber: mpesaReceipt.receiptNumber,
          paymentDate: mpesaReceipt.createdAt,
          bookingId: bookings.id,
          amountPaid: bookings.amountPaid,
        })
        .from(mpesaReceipt)
        .innerJoin(user, eq(user.id, mpesaReceipt.userId))
        .innerJoin(bookings, eq(bookings.id, mpesaReceipt.bookingId))
        .leftJoin(expedition, eq(expedition.id, bookings.expeditionId))
        .orderBy(desc(mpesaReceipt.createdAt));

      const [stats] = await tx
        .select({
          totalRevenue: sql<number>`
      COALESCE(
        SUM(${bookings.totalAmount})
        FILTER (
          WHERE ${bookings.paymentStatus} IN ('paid', 'partially_paid') 
        ),
        0
      )
    `.mapWith(Number),

          pendingRevenue: sql<number>`
      COALESCE(
        SUM(${bookings.totalAmount})
        FILTER (
          WHERE ${bookings.paymentStatus} = 'pending'
        ),
        0
      )
    `.mapWith(Number),

          refundedRevenue: sql<number>`
      COALESCE(
        SUM(${bookings.totalAmount})
        FILTER (
          WHERE ${bookings.paymentStatus} = 'refunded'
        ),
        0
      )
    `.mapWith(Number),

          transactionsCount: count(bookings.id),
        })
        .from(bookings);

      return { allReceipts, stats };
    });

    console.log(result.stats.transactionsCount);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching the receipts:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
