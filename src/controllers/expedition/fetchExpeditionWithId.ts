import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function fetchExpeditionWithId(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

    if (!expeditionId) {
      return res.status(403).json({
        success: false,
        message: "Please pass the expedition ID",
      });
    }

    const expeditionDetails = await db
      .select({
        expedition,
        adventure,
        bookedParticipants: sql<number>`COALESCE(SUM(${bookings.numberOfParticipants}),0)`,
      })
      .from(expedition)
      .where(eq(expedition.id, expeditionId))
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
      .leftJoin(bookings, eq(expedition.adventureId, adventure.id))
      .groupBy(expedition.id, adventure.id)
      .limit(1);

    if (expeditionDetails.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expedition not found" });
    }

    const result = expeditionDetails[0];

    const bookedParticipants = Number(result.bookedParticipants) || 0;

    const slotsLeft = Math.max(
      result.adventure.defaultCapacity - bookedParticipants,
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        ...result.expedition,
        adventure: result.adventure,
        bookedParticipants,
        slotsLeft,
      },
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
