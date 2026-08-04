import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { deleteImageFromCloudinary } from "../../helpers/uploadToCloudinary.js";

export async function deleteAdventure(req: Request, res: Response) {
  try {
    const { adventureId } = req.params as {
      adventureId: string;
    };

    const adventureExists = await db
      .select()
      .from(adventure)
      .where(eq(adventure.id, adventureId))
      .limit(1);

    if (adventureExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adventure not found",
      });
    }

    await db.delete(adventure).where(eq(adventure.id, adventureId));

    await deleteImageFromCloudinary(adventureExists.at(0)?.coverImagePublicId!);

    return res.status(200).json({
      success: true,
      message: "Adventure deleted successfully",
    });
  } catch (error) {
    const messages =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      messages,
    });
  }
}
