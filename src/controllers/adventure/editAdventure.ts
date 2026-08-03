import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { success } from "better-auth";

export async function editAdventure(req: Request, res: Response) {
  try {
    const { adventureId } = req.params as {
      adventureId: string;
    };
    if (!adventureId) {
      return res.status(400).json({
        success: false,
        message: "Adventure ID is required",
      });
    }

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

    const updateData: Record<string, any> = {};

    if (title?.trim()) updateData.title = title.trim();
    if (category?.trim()) updateData.category = category.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (shortDescription?.trim())
      updateData.shortDescription = shortDescription.trim();
    if (location?.trim()) updateData.location = location.trim();
    if (duration) updateData.duration = Number(duration);
    if (defaultPrice) updateData.defaultPrice = Number(defaultPrice);
    if (defaultCapacity) updateData.defaultCapacity = Number(defaultCapacity);
    if (isActive !== undefined)
      updateData.isActive = isActive === "true" || isActive === "1";
    if (coverImage?.trim()) updateData.coverImage = coverImage.trim();
    if (elevationGain) updateData.elevationGain = Number(elevationGain);
    if (difficulty?.trim()) updateData.difficulty = difficulty.trim();

    //checking if there are no empty update

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates available",
      });
    }

    //check if an adventure with the same title exists
    if (updateData.title) {
      const titleExists = await db
        .select()
        .from(adventure)
        .where(eq(adventure.title, updateData.title));

      if (titleExists.length > 0 && titleExists[0].id !== adventureId) {
        return res.status(409).json({
          success: false,
          message: "Adventure with the title already exists",
        });
      }
    }

    const [updatedAdventure] = await db
      .update(adventure)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(adventure.id, adventureId))
      .returning();

    return res.status(200).json({
      success: true,
      message: "Adventure updated successfully",
      data: updatedAdventure,
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
