import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRawRefreshToken,
  hashToken,
} from "../../helpers/authUtils.js";
import { db } from "../../index.js";
import { refreshTokens } from "../../db/schema.js";
import { and, eq, gt } from "drizzle-orm";
import { env } from "../../config/env.js";

export async function refresh(req: Request, res: Response) {
  try {
    const rawCookieToken = req.cookies.refreshToken;

    if (!rawCookieToken) {
      return res.status(404).json({
        success: false,
        message: "Access denied, Refresh token missing",
      });
    }

    const incomingHash = hashToken(rawCookieToken);

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, incomingHash),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!storedToken) {
      res.clearCookie("refreshToken");
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

    const newAccessToken = generateAccessToken(storedToken.userId);
    const newRawRefreshToken = generateRawRefreshToken();
    const newHash = hashToken(newRawRefreshToken);

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: storedToken.userId,
      tokenHash: newHash,
      expiresAt: newExpiration,
    });

    res.cookie("refreshToken", newRawRefreshToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal serve error",
    });
  }
}
