import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 8000),
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
  nodeEnv: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  adminEmails: process.env.ADMIN_EMAILS,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  betterAuthUrl: process.env.BETTER_AUTH_URL,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
} as const;
