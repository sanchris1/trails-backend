import { Response, Request } from "express";
import { adventure, expedition, favorites } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";

export const fetchUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const allUserFavorites = await db
      .select({
        expeditionId: expedition.id,
        image: adventure.coverImage,
        status: expedition.expeditionStatus,
        title: expedition.expeditionTitle,
        location: adventure.location,
        departureDate: expedition.departureDate,
        difficulty: adventure.difficulty,
      })
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .innerJoin(expedition, eq(expedition.id, favorites.expeditionId))
      .innerJoin(adventure, eq(adventure.id, expedition.adventureId));

    return res.status(200).json({
      success: true,
      allUserFavorites,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching favorites";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
