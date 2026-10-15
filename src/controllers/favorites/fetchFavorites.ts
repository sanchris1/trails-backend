import { Request, Response } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db } from "../../index.js";
import {
  adventure,
  expedition,
  favoriteMerchandise,
  favorites,
  merchandise,
  merchandiseImages,
} from "../../db/schema.js";

export const fetchAllUserFavorites = async (req: Request, res: Response) => {
  try {
    const [favoriteTrails, favoriteProducts] = await Promise.all([
      db
        .select({
          id: expedition.id,
          title: adventure.title,
          image: adventure.coverImage,
          location: adventure.location,
          departureDate: expedition.departureDate,
          duration: adventure.duration,
          difficulty: adventure.difficulty,
          status: expedition.expeditionStatus,
          likesCount: count(favorites.id),
          savedAt: favorites.createdAt,
        })
        .from(favorites)
        .innerJoin(expedition, eq(favorites.expeditionId, expedition.id))
        .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
        .groupBy(expedition.id, adventure.id, favorites.createdAt),

      db
        .select({
          id: merchandise.id,
          title: merchandise.title,
          image: merchandiseImages.images,
          category: merchandise.category,
          price: merchandise.price,
          stock: merchandise.stock,
          likesCount: count(favoriteMerchandise.id),
          savedAt: favoriteMerchandise.createdAt,
        })
        .from(favoriteMerchandise)
        .innerJoin(
          merchandise,
          eq(favoriteMerchandise.merchandiseId, merchandise.id),
        )
        .leftJoin(
          merchandiseImages,
          eq(merchandiseImages.merchandiseId, merchandise.id),
        )
        .groupBy(
          merchandise.id,
          merchandiseImages.id,
          favoriteMerchandise.createdAt,
        ),
    ]);

    const allFavorites = [
      ...favoriteTrails.map((item) => ({
        ...item,
        type: "expedition" as const,
        href: `/trails/${item.id}`,
        savedAt: item.savedAt,
      })),
      ...favoriteProducts.map((item) => ({
        ...item,
        type: "merchandise" as const,
        href: `/shop/${item.id}`,
        image: item.image?.[0]?.url ?? null,
        savedAt: item.savedAt,
      })),
    ].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );

    return res.status(200).json({
      success: true,
      allFavorites,
    });
  } catch (error) {
    console.error("Error fetching all favorites:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching favorites",
    });
  }
};
