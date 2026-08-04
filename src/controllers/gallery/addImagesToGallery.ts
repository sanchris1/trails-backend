import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, gallery } from "../../db/schema.js";
import { and, eq, lte } from "drizzle-orm";

export async function addImagesToGallery(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

    const { uploads } = req.body as any;

    const today = new Date().toLocaleString().split("T")[0];

    const isExpedition = await db
      .select()
      .from(expedition)
      .where(
        and(
          eq(expedition.id, expeditionId),
          lte(expedition.departureDate, today),
          lte(expedition.returnDate, today),
        ),
      )
      .limit(1);

    if (isExpedition.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expedition not found",
      });
    }

    const rows = uploads.map((image: any) => ({
      expeditionId,
      imageUrl: image.secure_url,
      imagePublicId: image.public_id,
      caption: image.caption,
    }));

    await db.insert(gallery).values(rows);

    return res
      .status(200)
      .json({ success: true, message: "Images upload successfully" });
  } catch (error) {
    console.log(error);

    const message =
      error instanceof Error ? error.message : "Error adding images to gallery";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
