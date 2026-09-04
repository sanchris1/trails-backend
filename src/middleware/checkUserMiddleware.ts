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
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token missing or malformed",
      });
    }

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          success: false,
          message: "Access token expired or invalid",
        });
      }
      const payload = decoded as TokenPayload;

      req.userId = payload.userId;

      next();
    });
  } catch (error) {
    const messages =
      error instanceof Error ? error.message : "Session or expired";
    res.status(500).json({
      success: false,
      messages,
    });
  }
}
