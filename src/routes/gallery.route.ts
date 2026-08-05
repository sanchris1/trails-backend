import { Router } from "express";
import { addImagesToGallery } from "../controllers/gallery/addImagesToGallery.js";
import { deleteGalleryImage } from "../controllers/gallery/deleteGalleryImage.js";
import { fetchGalleryImages } from "../controllers/gallery/fetchGalleryImages.js";
import { fetchExpeditionGalleryImages } from "../controllers/gallery/fetchExpeditionGalleryImages.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";

export const galleryRoute = Router();

galleryRoute.post(
  "/add/:expeditionId",
  checkUser,
  requireRole("admin"),
  addImagesToGallery,
);
galleryRoute.delete(
  "/delete/:expeditionId",
  checkUser,
  requireRole("admin"),
  deleteGalleryImage,
);
galleryRoute.get("/fetch-all", fetchGalleryImages);
galleryRoute.get("/fetch/:expeditionId", fetchExpeditionGalleryImages);
