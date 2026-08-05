import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, reviews } from "../../db/schema.js";
import { and, eq, ne } from "drizzle-orm";

export const addReview = async (req: Request, res: Response) => {
  try {
    const { expeditionId } = req.params as { expeditionId: string };
    const userId = req.user?.id!;

    const expeditionExists = await db
      .select()
      .from(expedition)
      .where(
        and(
          eq(expedition.id, expeditionId),
          ne(expedition.expeditionStatus, "cancelled"),
        ),
      );

    if (expeditionExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expedition does not exist",
      });
    }

    //check if its already reviewed by user
    const userAlreadyReviewed = await db
      .select()
      .from(reviews)
      .where(
        and(eq(reviews.expeditionId, expeditionId), eq(reviews.userId, userId)),
      );

    if (userAlreadyReviewed.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this expedition, you can update",
      });
    }

    //send the review
    const { rating, comment } = req.body as { rating: number; comment: string };

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Please add the rating",
      });
    }

    await db.insert(reviews).values({
      userId,
      expeditionId,
      rating,
      comment,
    });

    return res.status(200).json({
      success: false,
      message: "Review added successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error adding review";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
