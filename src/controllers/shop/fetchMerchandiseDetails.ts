import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchMerchandiseDetails(req: Request, res: Response) {
  try {
    const { merchandiseSlug } = req.params;

    if (!merchandiseSlug || typeof merchandiseSlug !== "string")
      return res.status(401).json({
        success: false,
        message: "Please pass the merchandise id to view the details",
      });

    const [result] = await db
      .select()
      .from(merchandise)
      .where(eq(merchandise.slug, merchandiseSlug))
      .innerJoin(
        merchandiseColors,
        eq(merchandise.id, merchandiseColors.merchandiseId),
      )
      .innerJoin(
        merchandiseImages,
        eq(merchandise.id, merchandiseImages.merchandiseId),
      )
      .limit(1);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Merchandise with the details not found.",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
