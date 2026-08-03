import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure, expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchAllExpeditions(_req: Request, res: Response) {
  try {
    const allExpeditions = await db
      .select()
      .from(expedition)
      .innerJoin(adventure, eq(expedition.adventureId, adventure.id));

    return res.status(200).json({
      success: true,
      data: allExpeditions.filter(
        (exp) => exp.expedition.expeditionStatus !== "cancelled",
      ),
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
