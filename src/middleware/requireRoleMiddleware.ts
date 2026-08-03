import { NextFunction, Request, Response } from "express";

export function requireRole(...allowedRole: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please authenticate",
      });
    }

    if (!req.user.role || !allowedRole.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You cannot perform this action",
      });
    }

    next();
  };
}
