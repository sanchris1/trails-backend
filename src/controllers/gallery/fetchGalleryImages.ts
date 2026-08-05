import { Request, Response } from "express";
import { db } from "../../index.js";
import { gallery } from "../../db/schema.js";
import { sql } from "drizzle-orm";

export async function fetchGalleryImages(req: Request, res: Response) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const images = await db.select().from(gallery).limit(limit).offset(offset);
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(gallery);

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      images: images.length > 0 ? images : [],
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching image";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
