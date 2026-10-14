import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, favorites } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";

export async function toggleFavorites(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const { id } = req.params as { id: string };

    const expeditionExists = await db
      .select()
      .from(expedition)
      .where(eq(expedition.id, id))
      .limit(1);

    if (expeditionExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expedition does not exists",
      });
    }

    let isFavorite: boolean;
    let message: string;

    const existingFavorite = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.expeditionId, id)));

    if (existingFavorite.length > 0) {
      await db
        .delete(favorites)
        .where(
          and(eq(favorites.userId, userId), eq(favorites.expeditionId, id)),
        );

      isFavorite = false;
      message = "Expedition removed from the favorites";
    } else {
      await db.insert(favorites).values({
        userId,
        expeditionId: id,
      });
      isFavorite = true;
      message = "Expedition added to the favorites";
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
