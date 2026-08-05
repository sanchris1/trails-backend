import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, gallery } from "../../db/schema.js";
import { and, eq } from "drizzle-orm";
import { deleteImageFromCloudinary } from "../../helpers/uploadToCloudinary.js";

export async function deleteGalleryImage(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };
    const { publicId } = req.body as { publicId: string };

    const hasGallery = await db
      .select()
      .from(expedition)
      .where(eq(expedition.id, expeditionId))
      .innerJoin(
        gallery,
        and(
          eq(gallery.expeditionId, expeditionId),
          eq(gallery.imagePublicId, publicId),
        ),
      );

    if (hasGallery.length === 0)
      return res.status(404).json({
        success: false,
        message: "No gallery found",
      });

    await deleteImageFromCloudinary(publicId);
    await db
      .delete(gallery)
      .where(
        and(
          eq(gallery.expeditionId, expeditionId),
          eq(gallery.imagePublicId, publicId),
        ),
      );
    res
      .status(200)
      .json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error deleting image";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
