import { Router, Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "The server is  healthy" });
});
