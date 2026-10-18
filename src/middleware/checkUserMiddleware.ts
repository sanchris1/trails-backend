import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export async function checkUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing or malformed",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as TokenPayload;

    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid",
    });
  }
}
