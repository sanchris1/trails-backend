import { Request, Response } from "express";

export async function sendUserNotification(req: Request, res: Response) {
  try {
    const sender = req.params as { userId: string };

      
      const { } = req.body as {
          
      }
      
      
      
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
