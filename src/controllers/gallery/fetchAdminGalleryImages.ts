import { Request, Response } from "express";
import { db } from "../../index.js";
import { gallery } from "../../db/schema.js";

export async function fetchAdminGalleryImages(_req: Request, res: Response) {
  try {
    const images = await db.select().from(gallery);

    return res.json(images);
  } catch (error) {
    console.error("Error getting the gallery images", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
