import { Request, Response } from "express";
import { checkEmail } from "../../helpers/email.js";
import { db } from "../../index.js";
import { refreshTokens, user } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { encodePassword } from "../../helpers/password.js";
import {
  generateAccessToken,
  generateRawRefreshToken,
  hashToken,
} from "../../helpers/authUtils.js";
import { env } from "../../config/env.js";

export async function signupUser(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (!name.trim() || !email.trim() || !password.trim()) {
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

    if (existingUser)
      return res.status(409).json({
        success: false,
        message: "User with the email already exists",
      });

    const hashedPassword = await encodePassword(password, 12);

    const adminEmails = process.env.ADMIN_EMAILS?.split(",") ?? [];

    const role: "user" | "admin" = adminEmails.includes(email)
      ? "admin"
      : "user";

    //creating the user
    const [newlyCreatedUser] = await db
      .insert(user)
      .values({ name, email, password: hashedPassword, role })
      .returning();

    const accessToken = generateAccessToken(newlyCreatedUser.id);
    const rawRefreshToken = generateRawRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: newlyCreatedUser.id,
      tokenHash,
      expiresAt: expirationDate,
    });

    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
