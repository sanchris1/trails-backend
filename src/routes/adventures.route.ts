import { Router } from "express";
import { addNewAdventure } from "../controllers/adventure/addNewAdventure.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { deleteAdventure } from "../controllers/adventure/deleteAdventure.js";
import { editAdventure } from "../controllers/adventure/editAdventure.js";
import { fetchAdventureWithId } from "../controllers/adventure/fetchAdventureWithId.js";
import { fetchAdventures } from "../controllers/adventure/fetchAdventures.js";

export const adventureRoutes = Router();

adventureRoutes.get("/get/:adventureId", fetchAdventureWithId);
adventureRoutes.get("/get", fetchAdventures);
adventureRoutes.post("/add", checkUser, requireRole("admin"), addNewAdventure);
adventureRoutes.delete(
  "/delete/:adventureId",
  checkUser,
  requireRole("admin"),
  deleteAdventure,
);
adventureRoutes.put(
  "/edit/:adventureId",
  checkUser,
  requireRole("admin"),
  editAdventure,
);
