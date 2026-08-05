import { Response, Request } from "express";
import { db } from "../../index.js";
import { adventure, favorites } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export const fetchFavorites = async (req: Request, res: Response) => {
  try {
    const allFavorites = await db
      .select()
      .from(favorites)
      .innerJoin(adventure, eq(adventure.id, favorites.adventureId));

    return res.status(200).json({
      success: true,
      data: allFavorites.length > 0 ? allFavorites : [],
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
