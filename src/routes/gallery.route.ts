import { Router } from "express";
import { addImagesToGallery } from "../controllers/gallery/addImagesToGallery.js";

export const galleryRoute = Router();

galleryRoute.post("/add/:expeditionId", addImagesToGallery);
