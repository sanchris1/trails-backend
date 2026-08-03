import { Request, Response } from "express";
import { db } from "../../index.js";
import { adventure } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function fetchAdventureWithId(req: Request, res: Response) {
  try {
    const { adventureId } = req.params as { adventureId: string };

    const adventureDetails = await db
      .select()
      .from(adventure)
      .where(eq(adventure.id, adventureId));

    if (!adventureDetails || adventureDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adventure not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: adventureDetails[0],
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
