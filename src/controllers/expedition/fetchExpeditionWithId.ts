import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchExpeditionWithId(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

    if (!expeditionId) {
      return res.status(403).json({
        success: false,
        message: "Please pass the expedition ID",
      });
    }

    const expeditionDetails = await db
      .select()
      .from(expedition)
      .where(eq(expedition.id, expeditionId))
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id))
      .limit(1);

    if (expeditionDetails.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expedition not found" });
    }

    return res.status(200).json({
      success: true,
      data: expeditionDetails.at(0),
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
