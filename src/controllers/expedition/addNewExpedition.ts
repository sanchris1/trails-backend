import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export type ExpeditionStatus =
  | "scheduled"
  | "ongoing"
  | "cancelled"
  | "completed";

export type CreateNewExpedition = {
  adventureId: string;
  departureDate: string;
  meetingPoint: string;
  guide: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  expeditionStatus: ExpeditionStatus;
};

export async function addNewExpedition(req: Request, res: Response) {
  try {
    const {
      departureDate,
      meetingPoint,
      guide,
      expeditionStatus,
      adventureId,
      departureTime,
      returnDate,
      returnTime,
    } = req.body as CreateNewExpedition;

    if (
      !departureTime.trim() ||
      !departureDate.trim() ||
      !meetingPoint.trim() ||
      !guide.trim() ||
      !expeditionStatus.trim()
    ) {
      return res.status(403).json({
        success: false,
        message: "Please add all the fields",
      });
    }

    if (!adventureId) {
      return res.status(403).json({
        success: false,
        message: "Adventure Id required",
      });
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

    //create a new expedition
    const newExp = await db
      .insert(expedition)
      .values({
        adventureId,
        departureDate,
        guide,
        meetingPoint,
        expeditionStatus,
        departureTime: new Date(departureTime),
        returnDate,
        returnTime: returnTime ? new Date(returnTime) : undefined,
      })
      .returning();

    return res.status(200).json({
      success: true,
      message: "Expedition added successfully",
      data: newExp,
    });
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
