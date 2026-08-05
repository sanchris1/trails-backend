import { Request, Response } from "express";
import { db } from "../../index.js";
import { gallery } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function fetchExpeditionGalleryImages(
  req: Request,
  res: Response,
) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const hasGallery = await db
      .select()
      .from(gallery)
      .where(eq(gallery.expeditionId, expeditionId))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(gallery);

    const totalPages = Math.ceil(count / limit);

    if (hasGallery.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No gallery found for this expedition",
      });
    }

    return res.status(200).json({
      success: true,
      data: hasGallery,
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
      error instanceof Error ? error.message : "Error fetching images";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
