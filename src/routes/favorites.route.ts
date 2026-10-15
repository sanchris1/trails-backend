import { Router } from "express";
import { toggleFavorites } from "../controllers/favorites/toggleFavorites.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchUserFavorites } from "../controllers/favorites/fetchUserFavorites.js";
import { fetchAllUserFavorites } from "../controllers/favorites/fetchFavorites.js";

export const favoritesRoute = Router();

favoritesRoute.put("/toggle/:id", toggleFavorites);
favoritesRoute.get("/fetch-user", fetchUserFavorites);
favoritesRoute.get("/fetch", requireRole, fetchAllUserFavorites);
