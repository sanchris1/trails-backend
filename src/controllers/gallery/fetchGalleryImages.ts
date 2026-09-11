import { Request, Response } from "express";
import { db } from "../../index.js";
import { gallery } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function fetchGalleryImages(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const expeditionId = req.query.expeditionId as string | undefined;

    // Base query
    let imagesQuery = db.select().from(gallery).$dynamic();
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(gallery)
      .$dynamic();

    // Filter by expedition when provided
    if (expeditionId) {
      imagesQuery = imagesQuery.where(eq(gallery.expeditionId, expeditionId));
      countQuery = countQuery.where(eq(gallery.expeditionId, expeditionId));
    }

    const images = await imagesQuery.limit(limit).offset(offset);
    const [{ count }] = await countQuery;

    const total = Number(count);
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      images: images ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    const message =
      error instanceof Error ? error.message : "Error fetching image";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}
