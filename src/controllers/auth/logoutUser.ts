import { Request, Response } from "express";
import { hashToken } from "../../helpers/authUtils.js";
import { db } from "../../index.js";
import { refreshTokens } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function logoutUser(req: Request, res: Response) {
  try {
    const rawCookieToken = req.cookies.refreshToken;

    if (rawCookieToken) {
      const incomingHash = hashToken(rawCookieToken);

      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenHash, incomingHash));
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
