import { Request, Response } from "express";
import { user } from "../../db/schema.js";
import { db } from "../../index.js";
import { eq } from "drizzle-orm";
import { comparePassword, encodePassword } from "../../helpers/password.js";

export async function updateUserPassword(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const [userExists] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      userExists.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const encodedNewPassword = await encodePassword(newPassword);

    await db
      .update(user)
      .set({ password: encodedNewPassword })
      .where(eq(user.id, userId));

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating user password:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
