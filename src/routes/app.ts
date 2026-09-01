import express from "express";
import cors from "cors";
import { auth } from "../lib/auth.js";
import { apiRouter } from "./index.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { notFound } from "../middleware/notFound.js";

export function createApplication() {
  const app = express();

  const allowedOrigins = [
    "http://localhost:3000",
    "https://trails-and-memoirs.vercel.app",
  ];

  // 1. CORS first
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouter);

  app.use(errorHandler);
  app.use(notFound);

  return app;
}
