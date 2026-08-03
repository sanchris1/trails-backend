import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { adventureRoutes } from "./adventures.route.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/adventures", adventureRoutes);
