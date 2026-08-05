import { Request, Response } from "express";
import { db } from "../../index.js";
import { reviews } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { success } from "better-auth";

export const fetchExpeditionReviews = async (req: Request, res: Response) => {
  try {
    const { expeditionId } = req.params as { expeditionId: string };

    const hasReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.expeditionId, expeditionId));

    return res.status(200).json({
      success: true,
      message: "Fetch complete",
      data: hasReview.length > 0 ? hasReview : [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error fetching reviews";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
