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

  app.use("/api", apiRouter);

  app.use(cors());

  app.use(express.urlencoded({ extended: true }));

  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  app.use(errorHandler);

  app.use(notFound);

  return app;
}
