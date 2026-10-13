import { Request, Response } from "express";
import { db } from "../../index.js";
import { and, desc, eq, or, sql } from "drizzle-orm";
import {
  adventure,
  bookings,
  expedition,
  notification,
} from "../../db/schema.js";
import { checkValueSign } from "../../helpers/valueSign.js";
import { calculatePercentageHelper } from "../../helpers/calculatePercentage.js";
import { getAdminId } from "../auth/fetchAdminId.js";

export async function fetchAdminDashboardStats(_req: Request, res: Response) {
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

      const adminId = await getAdminId();

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

      const expeditions = await tx
        .select({
          id: expedition.id,
          title: expedition.expeditionTitle,
          location: adventure.location,
          departureDate: expedition.departureDate,
          totalSlots: adventure.defaultCapacity,
          bookedSlots: sql<number>`COALESCE(SUM(${bookings.numberOfParticipants}),0)`,
        })
        .from(expedition)
        .leftJoin(adventure, eq(adventure.id, expedition.adventureId))
        .innerJoin(bookings, eq(bookings.expeditionId, expedition.id))
        .where(
          or(
            eq(expedition.expeditionStatus, "scheduled"),
            eq(expedition.expeditionStatus, "ongoing"),
          ),
        )
        .limit(3)
        .groupBy(
          expedition.id,
          adventure.id,
          expedition.expeditionTitle,
          adventure.location,
          expedition.departureDate,
          adventure.defaultCapacity,
        )
        .orderBy(desc(expedition.departureDate));

      const notifications = await tx
        .select({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          createdAt: notification.createdAt,
        })
        .from(notification)
        .where(
          and(
            eq(notification.recipientId, adminId),
            eq(notification.isRead, true),
          ),
        )
        .limit(5)
        .orderBy(desc(notification.createdAt));

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
        expeditions,
        notifications,
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
