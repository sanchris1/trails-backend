import { Request, Response } from "express";
import { db } from "../../index.js";
import { expedition, reviews } from "../../db/schema.js";
import { and, eq, ne } from "drizzle-orm";

export const updateReview = async (req: Request, res: Response) => {
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

    if (userAlreadyReviewed.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review not found please add a new one",
      });
    }

    //send the review
    const { rating, comment } = req.body as {
      rating: number;
      comment: string;
    };

    const updateReviewBody: any = {};

    if (rating || rating !== 0) updateReviewBody.rating = rating;
    if (comment || comment.trim().length !== 0)
      updateReviewBody.comment = comment;

    if (Object.keys(updateReviewBody).length === 0) {
      return res.status(401).json({
        success: false,
        message: "Please add some fields to review",
      });
    }

    await db
      .update(reviews)
      .set({ ...updateReviewBody })
      .where(
        and(eq(reviews.userId, userId), eq(reviews.expeditionId, expeditionId)),
      );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error updating review";
    res.status(500).json({
      success: false,
      message,
    });
  }
};
