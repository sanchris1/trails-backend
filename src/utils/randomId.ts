import { randomInt } from "node:crypto";

export function generateRandomPaymentId(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  return Array.from({ length }, () => chars[randomInt(chars.length)]).join("");
}
