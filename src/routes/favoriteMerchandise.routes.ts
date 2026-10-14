import { Router } from "express";
import { toggleFavoriteMerchandise } from "../controllers/favorites/merchandise/toggleFavoriteMerchandise.js";
import { fetchUserFavoriteMerchandise } from "../controllers/favorites/merchandise/fetchUserFavoriteMerchandise.js";

export const favoriteMerchandiseRoutes = Router();

favoriteMerchandiseRoutes.put("/toggle/:id", toggleFavoriteMerchandise);
favoriteMerchandiseRoutes.get("/fetch-user", fetchUserFavoriteMerchandise);
