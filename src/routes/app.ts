//entry file for express

import express from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import { notFound } from "../middleware/notFound.js";
import cors from "cors";
import { apiRouter } from "./index.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth.js";

export function createApplication() {
  const app = express();

  const allowedOrigins = [
    "http://localhost:3000",
    "https://trails-theta.vercel.app",
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
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

  app.use("/api", apiRouter);

  app.use(express.urlencoded({ extended: true }));

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  app.use(errorHandler);

  app.use(notFound);

  return app;
}
