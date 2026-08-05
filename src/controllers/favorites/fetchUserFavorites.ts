import { Response, Request } from "express";
import { adventure, favorites } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";

export const fetchUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id!;

    const allUserFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .innerJoin(adventure, eq(adventure.id, favorites.adventureId));

    return res.status(200).json({
      success: true,
      data: allUserFavorites.length > 0 ? allUserFavorites : [],
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
