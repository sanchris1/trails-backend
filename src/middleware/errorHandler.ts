import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger.js";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ error }, "unhandled error");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
