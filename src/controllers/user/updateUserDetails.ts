import { Request, Response } from "express";
import { notification, user } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";

export async function updateUserDetails(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const { name, email } = req.body;

    const isUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!isUser || isUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          name: name ?? isUser[0].name,
          email: email ?? isUser[0].email,
        })
        .where(eq(user.id, userId));

      await tx.insert(notification).values({
        recipientId: userId,
        type: "system",
        title: "Profile Updated",
        message: "Your profile details have been updated successfully.",
        createdAt: new Date(),
      });
    });

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
    });
  } catch (error) {
    console.log("Error updating user details:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
