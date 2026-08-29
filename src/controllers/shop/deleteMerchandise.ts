import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { deleteImageFromCloudinary } from "../../helpers/uploadToCloudinary.js";

export async function deleteMerchandise(req: Request, res: Response) {
  try {
    const { merchandiseId } = req.params as {
      merchandiseId: string;
    };

    if (!merchandiseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the merchandise Id",
      });
    }

    const [isMerchandise] = await db
      .select()
      .from(merchandise)
      .leftJoin(
        merchandiseImages,
        eq(merchandiseImages.merchandiseId, merchandiseId),
      )
      .leftJoin(
        merchandiseColors,
        eq(merchandiseColors.merchandiseId, merchandiseId),
      )
      .where(eq(merchandise.id, merchandiseId));

    if (!isMerchandise) {
      return res.status(404).json({
        success: false,
        message: "Merchandise not found",
      });
    }

    //the deletion

    const imagesToBeDeleted = isMerchandise.merchandise_images?.images ?? [];

    if (imagesToBeDeleted.length > 0) {
      await Promise.all(
        imagesToBeDeleted.map((item) =>
          deleteImageFromCloudinary(item.publicId),
        ),
      );
    }

    await db
      .delete(merchandiseColors)
      .where(eq(merchandiseColors.merchandiseId, merchandiseId));

    await db
      .delete(merchandiseImages)
      .where(eq(merchandiseImages.merchandiseId, merchandiseId));

    await db.delete(merchandise).where(eq(merchandise.id, merchandiseId));

    return res.status(200).json({
      success: true,
      message: "Successfully deleted the merchandise ",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
