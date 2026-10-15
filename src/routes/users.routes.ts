import { Router } from "express";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchAllUsers } from "../controllers/user/fetchAllusers.js";

export const usersRoutes = Router();

usersRoutes.get("/fetch-all", requireRole, fetchAllUsers);
