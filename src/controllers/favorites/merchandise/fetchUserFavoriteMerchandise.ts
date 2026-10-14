import { Response, Request } from "express";
import { eq } from "drizzle-orm";
import {
  favoriteMerchandise,
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../../db/schema.js";
import { db } from "../../../index.js";

export const fetchUserFavoriteMerchandise = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.userId;

    const allUserFavoritesMerchandise = await db
      .select({
        id: merchandise.id,
        slug: merchandise.slug,
        images: merchandiseImages.images,
        title: merchandise.title,
        category: merchandise.category,
        price: merchandise.price,
        stock: merchandise.stock,
      })
      .from(favoriteMerchandise)
      .innerJoin(
        merchandise,
        eq(merchandise.id, favoriteMerchandise.merchandiseId),
      )
      .innerJoin(
        merchandiseColors,
        eq(merchandiseColors.merchandiseId, merchandise.id),
      )
      .innerJoin(
        merchandiseImages,
        eq(merchandiseImages.merchandiseId, merchandise.id),
      )
      .where(eq(favoriteMerchandise.userId, userId));

    return res.status(200).json({
      success: true,
      allUserFavoritesMerchandise,
    });
  } catch (error) {
    console.log(error);
    const message =
      error instanceof Error ? error.message : "Error fetching favorites";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
