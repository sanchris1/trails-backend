import { Request, Response } from "express";
import { db } from "../../index.js";
import { sql } from "drizzle-orm";
import { bookings } from "../../db/schema.js";
import { checkValueSign } from "../../helpers/valueSign.js";
import { calculatePercentageHelper } from "../../helpers/calculatePercentage.js";

export async function fetchAdminDashboardStats(req: Request, res: Response) {
  try {
    const stats = await db.transaction(async (tx) => {
      const today = new Date();

      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const nextMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        1,
      );
      const lastMonthStart = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1,
      );

      const [metrics] = await tx
        .select({
          currentRevenue: sql<number>`
                COALESCE(SUM(${bookings.totalAmount}) FILTER (
                    WHERE ${bookings.createdAt} >= ${thisMonthStart} AND  ${bookings.createdAt}<${nextMonthStart}
                ),0)`.mapWith(Number),

          currentParticipants: sql<number>`
          COALESCE(SUM(${bookings.numberOfParticipants}) FILTER(
            WHERE ${bookings.createdAt} >= ${thisMonthStart} AND ${bookings.createdAt} < ${nextMonthStart}
          ),0)
          `.mapWith(Number),

          currentBookings: sql<number>`
        COUNT(*) FILTER (
            WHERE ${bookings.createdAt} < ${nextMonthStart} AND ${bookings.createdAt} >= ${thisMonthStart}
        )
        `.mapWith(Number),

          lastRevenue: sql<number>`
          COALESCE(SUM(${bookings.totalAmount}) FILTER (
            WHERE ${bookings.createdAt}< ${thisMonthStart} AND ${bookings.createdAt}>=${lastMonthStart}
          ),0)
`.mapWith(Number),

          lastParticipants: sql<number>`
          COALESCE(SUM(${bookings.numberOfParticipants}) FILTER(
            WHERE ${bookings.createdAt}<${thisMonthStart} AND ${bookings.createdAt}>=${lastMonthStart}
          ),0)
        `.mapWith(Number),

          lastBookings: sql<number>`
          COUNT(*)FILTER(
            WHERE ${bookings.createdAt}<${thisMonthStart} AND ${bookings.createdAt}>=${lastMonthStart}
          )
        `.mapWith(Number),
        })
        .from(bookings);

      const participantsDifference =
        metrics.currentParticipants - metrics.lastParticipants;
      const revenueDifference = metrics.currentRevenue - metrics.lastRevenue;
      const bookingsDifference = metrics.currentBookings - metrics.lastBookings;

      return {
        revenue: {
          total: metrics.currentRevenue,
          differenceAsPercentage: calculatePercentageHelper(
            metrics.currentRevenue,
            metrics.lastRevenue,
          ).toFixed(1),
          signage: checkValueSign(revenueDifference),
        },
        bookings: {
          total: metrics.currentBookings,
          differenceAsPercentage: calculatePercentageHelper(
            metrics.currentBookings,
            metrics.lastBookings,
          ).toFixed(1),
          signage: checkValueSign(bookingsDifference),
        },
        participants: {
          total: metrics.currentParticipants,
          differenceAsPercentage: calculatePercentageHelper(
            metrics.currentParticipants,
            metrics.lastParticipants,
          ).toFixed(1),
          signage: checkValueSign(participantsDifference),
        },
      };
    });

    return res.json(stats);
  } catch (error) {
    console.error("Error fetching the admin dashboard stats", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
