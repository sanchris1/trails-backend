import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, gallery } from "../../db/schema.js";
import { and, eq, lte } from "drizzle-orm";

export async function addImagesToGallery(req: Request, res: Response) {
  try {
    console.log("Reaching...");
    const { expeditionId } = req.params as { expeditionId: string };

    const images = req.body;

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
        message:
          "Gallery images can only be added after the expedition has ended",
      });
    }
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const rows = images.map((image: any) => ({
      expeditionId,
      imageUrl: image.imageUrl,
      imagePublicId: image.imagePublicId,
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
