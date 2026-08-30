import { Request, Response } from "express";
import { auth } from "../../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export async function getSession(req: Request, res: Response) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
