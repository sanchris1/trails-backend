import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, expedition, gallery } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function expeditionsWithGalleries(req: Request, res: Response) {
  try {
    const result = await db
      .selectDistinctOn([gallery.expeditionId], {
        id: expedition.id,
        name: expedition.expeditionTitle,
        coverImage: adventure.coverImage,
        departureDate: expedition.departureDate,
      })
      .from(gallery)
      .innerJoin(expedition, eq(gallery.expeditionId, expedition.id))
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
      .orderBy(gallery.expeditionId);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
