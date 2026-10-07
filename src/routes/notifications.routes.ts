import { Router } from "express";
import { fetchAllNotifications } from "../controllers/notifications/fetchAllNotifications.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { markAsReadNotification } from "../controllers/notifications/markAsReadNotification.js";
import { deleteNotification } from "../controllers/notifications/deleteNotification.js";
import { sendAdminNotification } from "../controllers/notifications/sendAdminNotification.js";

export const notificationsRoute = Router();

notificationsRoute.get("/fetch-all", requireRole, fetchAllNotifications);
notificationsRoute.put("/set-read/:notificationId", markAsReadNotification);
notificationsRoute.delete(
  "/delete/:notificationId",
  requireRole,
  deleteNotification,
);

notificationsRoute.post("/suggestion", sendAdminNotification);
