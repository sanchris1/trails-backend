import { Router } from "express";
import { addNewExpedition } from "../controllers/expedition/addNewExpedition.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { deleteExpedition } from "../controllers/expedition/deleteExpedition.js";
import { editExpedition } from "../controllers/expedition/editExpedition.js";
import { fetchAllExpeditions } from "../controllers/expedition/fetchAllExpeditions.js";
import { fetchExpeditionWithId } from "../controllers/expedition/fetchExpeditionWithId.js";
import { cancelExpedition } from "../controllers/expedition/cancelExpedition.js";

export const expeditionRoutes = Router();

expeditionRoutes.get("/get", fetchAllExpeditions);

expeditionRoutes.get("/get/:expeditionId", fetchExpeditionWithId);

expeditionRoutes.put(
  "/cancel/:expeditionId",
  checkUser,
  requireRole,
  cancelExpedition,
);
expeditionRoutes.post("/add", checkUser, requireRole, addNewExpedition);
expeditionRoutes.delete(
  "/delete/:expeditionId",
  checkUser,
  requireRole,
  deleteExpedition,
);

expeditionRoutes.put(
  "/edit/:expeditionId",
  checkUser,
  requireRole,
  editExpedition,
);
