import { Router } from "express";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchAllUsers } from "../controllers/user/fetchAllusers.js";
import { updateUserDetails } from "../controllers/user/updateUserDetails.js";
import { updateUserPassword } from "../controllers/user/updatePassword.js";
import { deleteAccount } from "../controllers/user/deleteAccount.js";

export const usersRoutes = Router();

usersRoutes.get("/fetch-all", requireRole, fetchAllUsers);
usersRoutes.put("/update-details", updateUserDetails);
usersRoutes.put("/update-password", updateUserPassword);
usersRoutes.delete("/delete-account", deleteAccount);
