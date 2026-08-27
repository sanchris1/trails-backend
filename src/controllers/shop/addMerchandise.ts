import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../db/schema.js";

export async function addMerchandise(req: Request, res: Response) {
  try {
    console.log(req.body);

    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized!" });
    }

    const { title, price, description, colors, images, category } =
      req.body as {
        title: string;
        price: number;
        category: string;
        description: string;
        colors: string;
        images: {
          url: string;
          publicId: string;
        }[];
      };

    if (
      !title.trim() ||
      !price ||
      !description.trim() ||
      !category.trim() ||
      !Array.isArray(images) ||
      images.length === 0 ||
      !Array.isArray(colors) ||
      colors.length === 0
    ) {
      return res.status(401).json({
        success: false,
        message: "Please add all the fields",
      });
    }

    const newMerchandise = await db
      .insert(merchandise)
      .values({ price, title, description, category })
      .returning();

    const currentMerchandiseId = newMerchandise[0]?.id;

    await db
      .insert(merchandiseColors)
      .values({ colors, merchandiseId: currentMerchandiseId });

    await db
      .insert(merchandiseImages)
      .values({ images, merchandiseId: currentMerchandiseId });

    return res.status(200).json({
      success: true,
      message: "New merchandise created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
