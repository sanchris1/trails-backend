import { Request, Response } from "express";

import { and, eq } from "drizzle-orm";
import { favoriteMerchandise, merchandise } from "../../../db/schema.js";
import { db } from "../../../index.js";

export async function toggleFavoriteMerchandise(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params as { id: string };

    const merchandiseExists = await db
      .select()
      .from(merchandise)
      .where(eq(merchandise.id, id))
      .limit(1);

    if (merchandiseExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Merchandise does not exists",
      });
    }

    let isFavorite: boolean;
    let message: string;

    const existingFavorite = await db
      .select()
      .from(favoriteMerchandise)
      .where(
        and(
          eq(favoriteMerchandise.userId, userId),
          eq(favoriteMerchandise.merchandiseId, id),
        ),
      );

    if (existingFavorite.length > 0) {
      await db
        .delete(favoriteMerchandise)
        .where(
          and(
            eq(favoriteMerchandise.userId, userId),
            eq(favoriteMerchandise.merchandiseId, id),
          ),
        );

      isFavorite = false;
      message = "Merchandise removed from the favorites";
    } else {
      await db.insert(favoriteMerchandise).values({
        userId,
        merchandiseId: id,
      });
      isFavorite = true;
      message = "Merchandise added to the favorites";
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
