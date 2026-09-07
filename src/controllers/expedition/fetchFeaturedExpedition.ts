import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { asc, desc, eq, gte, sql } from "drizzle-orm";

export async function fetchFeaturedExpedition(req: Request, res: Response) {
  try {
    const [row] = await db
      .select({
        expedition,
        adventure,
        bookedParticipants: sql<number>`COALESCE(
            (SELECT SUM (${bookings.numberOfParticipants})::int 
            FROM ${bookings}
            WHERE ${bookings.expeditionId} = ${expedition.id} 
            AND ${bookings.bookingStatus}!='cancelled'),0
        )`,
      })
      .from(expedition)
      .leftJoin(adventure, eq(expedition.adventureId, adventure.id))
      .orderBy(desc(expedition.departureDate))
      .limit(1);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found",
      });
    }

    const featuredExpedition = {
      expedition: {
        ...row.expedition,
        slotsLeft: row.adventure!.defaultCapacity - row.bookedParticipants,
      },
      adventure: row.adventure,
    };

    console.log(featuredExpedition);

    return res.json(featuredExpedition);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
