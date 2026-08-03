import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function addNewAdventure(req: Request, res: Response) {
  try {
    const {
      title,
      category,
      description,
      shortDescription,
      location,
      duration,
      defaultPrice,
      defaultCapacity,
      isActive,
      coverImage,
      elevationGain,
      difficulty,
    } = req.body as Record<string, string | undefined>;

    if (
      !title?.trim() ||
      !category?.trim() ||
      !description?.trim() ||
      !shortDescription?.trim() ||
      !location?.trim() ||
      !duration ||
      !defaultPrice ||
      !defaultCapacity ||
      !isActive ||
      !coverImage?.trim() ||
      !difficulty?.trim()
    ) {
      return res.status(401).json({
        success: false,
        message: "Please add all fields",
      });
    }

    const existing = await db
      .select()
      .from(adventure)
      .where(eq(adventure.title, title?.trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Adventure with the title already exists",
      });
    }

    await db.insert(adventure).values({
      title,
      category,
      description,
      shortDescription,
      location,
      duration,
      defaultCapacity: Number(defaultCapacity),
      defaultPrice: Number(defaultPrice),
      isActive: isActive === "true",
      coverImage,
      elevationGain: elevationGain ? Number(elevationGain) : 0,
      difficulty,
    });

    return res.status(201).json({
      success: true,
      message: "Adventure created successfully",
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
