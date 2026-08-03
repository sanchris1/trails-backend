import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { adventureRoutes } from "./adventures.route.js";
import { expeditionRoutes } from "./expeditions.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/adventures", adventureRoutes);
apiRouter.use("/expeditions", expeditionRoutes);
