import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, bookings, expedition } from "../../db/schema.js";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { ExpeditionStatus } from "./addNewExpedition.js";

export async function fetchAllExpeditions(req: Request, res: Response) {
  try {
    const { search, sortBy, status } = req.query as Record<
      string,
      string | undefined
    >;

    const conditions = [];

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(adventure.title, term),
          ilike(adventure.location, term),
          ilike(adventure.category, term),
          ilike(adventure.shortDescription, term),
          ilike(adventure.description, term),
          ilike(expedition.guide, term),
          ilike(expedition.guideContact, term),
          ilike(expedition.meetingPoint, term),
          ilike(expedition.meetingPoint, term),
        ),
      );
    }

    if (status && status !== "all") {
      conditions.push(
        eq(expedition.expeditionStatus, status as ExpeditionStatus),
      );
    }

    let orderBy;

    switch (sortBy) {
      case "departure_desc":
        orderBy = desc(expedition.departureTime);
        break;

      case "created_desc":
        orderBy = desc(expedition.createdAt);
        break;

      case "created_asc":
        orderBy = asc(expedition.createdAt);
        break;

      case "title_asc":
        orderBy = asc(adventure.title);
        break;

      case "title_desc":
        orderBy = desc(adventure.title);
        break;

      case "departure_asc":
      default:
        orderBy = asc(expedition.departureTime);
    }

    const results = await db
      .select({
        expedition,
        adventure,
        bookedParticipants: sql<number>`COALESCE(SUM(${bookings.numberOfParticipants}),0)`,
      })
      .from(expedition)
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
      .leftJoin(bookings, eq(bookings.expeditionId, expedition.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .groupBy(expedition.id, adventure.id)
      .orderBy(orderBy);

    const data = results.map((item) => {
      const bookedParticipants = Number(item.bookedParticipants) || 0;
      const capacity = item.adventure.defaultCapacity;
      return {
        ...item.expedition,
        adventure: item.adventure,
        bookedParticipants,
        slotsLeft: Math.max(capacity - bookedParticipants, 0),
      };
    });

    return res.status(200).json({
      success: true,
      data,
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
