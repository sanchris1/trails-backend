import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

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

    const payload = jwt.verify(token, env.accessToken!) as TokenPayload;

    req.userId = payload.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Access token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid access token:", error.message);
    } else {
      console.error("Access token verification failed:", error);
    }
    return res.status(401).json({
      success: false,
      message: "Access token expired or invalid",
    });
  }
}
