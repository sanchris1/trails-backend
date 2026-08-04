import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { adventureRoutes } from "./adventures.route.js";
import { expeditionRoutes } from "./expeditions.routes.js";
import { bookingRoute } from "./booking.route.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { imageUploadRoute } from "./imageUpload.route.js";
import { galleryRoute } from "./gallery.route.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/adventures", adventureRoutes);
apiRouter.use("/expeditions", expeditionRoutes);
apiRouter.use("/booking", checkUser, bookingRoute);
apiRouter.use("/image", checkUser, requireRole("admin"), imageUploadRoute);
apiRouter.use("/gallery", checkUser, requireRole("admin"), galleryRoute);
