import { Request, Response } from "express";
import { db } from "../../index.js";
import { checkEmail } from "../../helpers/email.js";
import { refreshTokens, user } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { comparePassword } from "../../helpers/password.js";
import {
  generateAccessToken,
  generateRawRefreshToken,
  hashToken,
} from "../../helpers/authUtils.js";

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email.trim() || !password.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Please add all the fields" });
    }

    const correctEmail = checkEmail(email.trim());

    if (!correctEmail) {
      return res.status(400).json({
        success: false,
        message: "Please add the correct email format",
      });
    }

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email.trim()));

    if (!existingUser)
      return res.status(404).json({
        success: false,
        message: "User with the email does not exists",
      });

    const checkUserPassword = await comparePassword(
      password,
      existingUser.password,
    );

    if (!checkUserPassword) {
      return res.status(400).json({
        success: false,
        message: "The password did ot match, try again.",
      });
    }

    const accessToken = generateAccessToken(existingUser.id);
    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    await db
      .update(user)
      .set({ lastLoginAt: new Date() })
      .where(eq(user.id, existingUser.id));

    await db.insert(refreshTokens).values({
      userId: existingUser.id,
      tokenHash,
      expiresAt: expirationDate,
    });

    console.log(
      "Raw refresh token:",
      !!rawRefreshToken,
      rawRefreshToken?.slice?.(0, 12),
    );

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, message: "User logged in successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
