import { Router } from "express";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchAdminDashboardStats } from "../controllers/admin-dashboard/fetchAdminDashboardStats.js";

export const adminDashboardRoute = Router();

adminDashboardRoute.get(
  "/stats",
  checkUser,
  requireRole,
  fetchAdminDashboardStats,
);
