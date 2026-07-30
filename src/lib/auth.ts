import { betterAuth } from "better-auth";
import { db } from "../index.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
});
