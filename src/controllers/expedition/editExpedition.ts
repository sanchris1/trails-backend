import { Request, Response } from "express";
import { adventure, expedition } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";
import { CreateNewExpedition } from "./addNewExpedition.js";

export async function editExpedition(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

    const {
      departureDate,
      meetingPoint,
      expeditionStatus,
      adventureId,
      departureTime,
      returnDate,
      returnTime,
    } = req.body as CreateNewExpedition;

    if (!expeditionId) {
      return res.status(403).json({
        success: false,
        message: "Please pass the expedition ID",
      });
    }

    const isExpedition = await db
      .select()
      .from(expedition)
      .where(eq(expedition.id, expeditionId))
      .limit(1);

    if (isExpedition.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expedition not found" });
    }

    //is an adventure
    const existingAdventure = await db
      .select()
      .from(adventure)
      .where(eq(adventure.id, adventureId))
      .limit(1);

    if (existingAdventure.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adventure does not exist",
      });
    }

    const updateExpeditionData: Record<string, any> = {};

    if (departureDate.trim())
      updateExpeditionData.departureDate = departureDate.trim();

    if (meetingPoint.trim())
      updateExpeditionData.meetingPoint = meetingPoint.trim();

    if (expeditionStatus.trim())
      updateExpeditionData.expeditionStatus = expeditionStatus.trim();

    if (departureTime.trim())
      updateExpeditionData.departureTime = departureTime.trim();

    if (returnDate.trim()) updateExpeditionData.returnDate = returnDate.trim();

    if (returnTime.trim()) updateExpeditionData.returnTime = returnTime.trim();

    if (Object.keys(updateExpeditionData).length === 0) {
      return res.status(402).json({
        success: false,
        message: "Update data not provided",
      });
    }

    const updatedExpedition = await db.update(expedition).set({
      ...updateExpeditionData,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Expedition successfully updated",
      data: updatedExpedition,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
