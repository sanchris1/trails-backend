import { Request, Response } from "express";

export async function getSession(req: Request, res: Response) {
  try {
    // const session = await
    // if (!session) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "Session not found" });
    // }
    // return res.status(200).json(session);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
