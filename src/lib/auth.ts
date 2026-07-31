import { betterAuth } from "better-auth";
import { db } from "../index.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../config/env.js";
import * as schema from "../../src/db/schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),

  trustedOrigins: ["http://localhost:3000"],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const adminEmails =
            env.adminEmails?.split(",").map((e) => e.trim()) ?? [];

          return {
            data: {
              ...user,
              role: adminEmails.includes(user.email) ? "admin" : "user",
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    },
  },
});
