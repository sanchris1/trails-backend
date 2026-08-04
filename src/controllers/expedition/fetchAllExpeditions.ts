import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function fetchAllExpeditions(_req: Request, res: Response) {
  try {
    const allExpeditions = await db
      .select()
      .from(expedition)
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id));

    const totals = await db
      .select({
        expeditionId: bookings.expeditionId,
        totalParticipants: sql<number>`COALESCE(SUM(${bookings.numberOfParticipants}),0)`,
      })
      .from(bookings)
      .groupBy(bookings.expeditionId);

    const participantsMap = new Map(
      totals.map((t) => [t.expeditionId, t.totalParticipants]),
    );

    const data = allExpeditions.map((exp) => {
      const booked = participantsMap.get(exp.expedition.id) ?? 0;

      return {
        ...exp,
        bookedParticipants: booked,
        slotsLeft: exp.adventure.defaultCapacity - booked,
      };
    });

    return res.status(200).json({
      success: true,
      data: data.filter(
        (exp) => exp.expedition.expeditionStatus !== "cancelled",
      ),
    });
  } catch (error) {
    const messages =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      messages,
    });
  }
}
