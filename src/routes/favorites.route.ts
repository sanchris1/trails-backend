import { Router } from "express";
import { toggleFavorites } from "../controllers/favorites/toggleFavorites.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchFavorites } from "../controllers/favorites/fetchFavorites.js";
import { fetchUserFavorites } from "../controllers/favorites/fetchUserFavorites.js";

export const favoritesRoute = Router();

favoritesRoute.put("/toggle/:adventureId", toggleFavorites);
favoritesRoute.get("/fetch-user", fetchUserFavorites);
favoritesRoute.get("/fetch", requireRole("admin"), fetchFavorites);
