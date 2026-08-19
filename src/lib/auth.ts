import { betterAuth } from "better-auth";
import { db } from "../index.js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "../config/env.js";
import * as schema from "../../src/db/schema.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),

  baseURL: env.betterAuthUrl,

  trustedOrigins: [
    "http://localhost:3000",
    "https://trails-and-memoirs.vercel.app",
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/",
      partitioned: true,
    },
  },

  account: {
    storeStateStrategy: "cookie",
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

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

  emailVerification: {
    sendVerificationEmail: async ({ url }) => {
      console.log("Verification URL", url);
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
