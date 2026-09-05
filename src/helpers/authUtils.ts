import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.refreshToken!, {
    expiresIn: "15m",
  });
}

export function generateRawRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
