import { Request, Response } from "express";
import { eq } from "drizzle-orm";
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
          favoriteId: favorites.id,
          id: expedition.id,
          title: adventure.title,
          image: adventure.coverImage,
          location: adventure.location,
          departureDate: expedition.departureDate,
          duration: adventure.duration,
          difficulty: adventure.difficulty,
          status: expedition.expeditionStatus,
          savedAt: favorites.createdAt,
        })
        .from(favorites)
        .innerJoin(expedition, eq(favorites.expeditionId, expedition.id))
        .innerJoin(adventure, eq(expedition.adventureId, adventure.id)),
      db
        .select({
          favoriteId: favoriteMerchandise.id,
          id: merchandise.id,
          title: merchandise.title,
          image: merchandiseImages.images,
          category: merchandise.category,
          price: merchandise.price,
          stock: merchandise.stock,
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
        ),
    ]);

    const allFavorites = [
      ...favoriteTrails.map((item) => ({
        ...item,
        type: "expedition" as const,
        href: `/trails/${item.id}`,
        image: item.image,
      })),
      ...favoriteProducts.map((item) => ({
        ...item,
        type: "merchandise" as const,
        href: `/shop/${item.id}`,
        image: item.image?.[0]?.url ?? null,
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
