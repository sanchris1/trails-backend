import { Request, Response } from "express";
import { eq, count, max } from "drizzle-orm";
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
    const expeditionLikes = db
      .select({
        expeditionId: favorites.expeditionId,
        likesCount: count(favorites.id).as("likesCount"),
        savedAt: max(favorites.createdAt).as("savedAt"),
      })
      .from(favorites)
      .groupBy(favorites.expeditionId)
      .as("expeditionLikes");

    // Aggregate merchandise likes BEFORE joining images
    const productLikes = db
      .select({
        merchandiseId: favoriteMerchandise.merchandiseId,
        likesCount: count(favoriteMerchandise.id).as("likesCount"),
        savedAt: max(favoriteMerchandise.createdAt).as("savedAt"),
      })
      .from(favoriteMerchandise)
      .groupBy(favoriteMerchandise.merchandiseId)
      .as("productLikes");

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
          likesCount: expeditionLikes.likesCount,
          savedAt: expeditionLikes.savedAt,
        })
        .from(expeditionLikes)
        .innerJoin(expedition, eq(expeditionLikes.expeditionId, expedition.id))
        .innerJoin(adventure, eq(expedition.adventureId, adventure.id)),

      db
        .select({
          id: merchandise.id,
          title: merchandise.title,
          image: merchandiseImages.images,
          category: merchandise.category,
          price: merchandise.price,
          stock: merchandise.stock,
          likesCount: productLikes.likesCount,
          savedAt: productLikes.savedAt,
        })
        .from(productLikes)
        .innerJoin(merchandise, eq(productLikes.merchandiseId, merchandise.id))
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
      })),

      ...favoriteProducts.map((item) => ({
        ...item,
        type: "merchandise" as const,
        href: `/shop/${item.id}`,
        image: item.image?.[0]?.url ?? null,
      })),
    ].sort(
      (a, b) =>
        new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime(),
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
