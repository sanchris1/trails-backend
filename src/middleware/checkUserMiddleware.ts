import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string | null;
        email: string;
        name: string;
        image?: string | null;
      };
      session?: {
        id: string;
        userId: string;
        expiresAt: Date;
        token?: string;
      };
    }
  }
}
export async function checkUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "Please authenticate",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    const messages =
      error instanceof Error ? error.message : "Session or expired";
    res.status(500).json({
      success: false,
      messages,
    });
  }
}
