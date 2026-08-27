import { Router } from "express";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { addMerchandise } from "../controllers/shop/addMerchandise.js";

export const shopRouter = Router();

shopRouter.post("/add", checkUser, requireRole("admin"), addMerchandise);
