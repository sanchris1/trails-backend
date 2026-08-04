import { Router, Request, Response } from "express";
import { uploadToCloudinary } from "../helpers/uploadToCloudinary.js";
import { upload } from "../middleware/multer.upload.js";

export const imageUploadRoute = Router();

imageUploadRoute.post(
  "/image-upload",
  upload.array("images", 20),
  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[];

      if (!imageFiles.length)
        return res.status(403).json({
          success: false,
          message: "Please add the file to upload",
        });

      const results = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file)),
      );

      return res.status(200).json({
        success: true,
        message: "Image upload success",
        data: results,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  },
);
