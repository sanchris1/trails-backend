import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, favorites } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

export async function toggleFavorites(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { adventureId } = req.params as { adventureId: string };

    const adventureExists = await db
      .select()
      .from(adventure)
      .where(eq(adventure.id, adventureId))
      .limit(1);

    if (adventureExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adventure does not exists",
      });
    }

    let isFavorite: boolean;
    let message: string;

    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.adventureId, adventureId),
        ),
      );

    if (existingFavorite.length > 0) {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, userId),
            eq(favorites.adventureId, adventureId),
          ),
        );

      isFavorite = false;
      message = "Adventure removed from the favorites";
    } else {
      await db.insert(favorites).values({
        userId,
        adventureId,
      });
      isFavorite = true;
      message = "Adventure added to the favorites";
    }

    return res.status(200).json({
      success: true,
      isFavorite,
      message,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error toggling favorites";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
