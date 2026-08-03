import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function deleteExpedition(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

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

    await db.delete(expedition).where(eq(expedition.id, expeditionId));

    return res.status(200).json({
      success: true,
      message: "Expedition deleted successfully",
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
