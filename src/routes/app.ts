//entry file for express

import express from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import { notFound } from "../middleware/notFound.js";

export function createApplication() {
  const app = express();

  app.use(express.json());

  app.use(errorHandler);

  app.use(express.urlencoded({ extended: true }));

  app.use(notFound);
}
