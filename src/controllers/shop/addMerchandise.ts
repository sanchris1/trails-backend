import { Request, Response } from "express";
import { db } from "../../index.js";
import {
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";

export async function addMerchandise(req: Request, res: Response) {
  try {
    const { title, price, description, colors, images, category, stock, tags } =
      req.body as {
        title: string;
        price: number;
        category: string;
        stock: number;
        description: string;
        colors: string[];
        tags?: string;
        images: { url: string; publicId: string }[];
      };

    // ---------- Validation ----------
    const isInvalid =
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      price == null ||
      price < 0 ||
      stock == null ||
      stock < 0 ||
      !Array.isArray(colors) ||
      colors.length === 0 ||
      !Array.isArray(images) ||
      images.length === 0;

    if (isInvalid) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    const merchandiseSlug = title.trim().toLowerCase().split(" ").join("-");
    const merchandiseTags = tags?.trim()
      ? tags
          .trim()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    console.log("Creating merchandise with title:", title);
    console.log("Slug:", merchandiseSlug);
    console.log("Request received at:", new Date().toISOString());

    // ---------- Check for existing slug ----------
    const existing = await db
      .select({ id: merchandise.id })
      .from(merchandise)
      .where(eq(merchandise.slug, merchandiseSlug))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Merchandise with this title already exists",
      });
    }

    // ---------- Insert everything in a transaction ----------
    const result = await db.transaction(async (tx) => {
      const [newMerchandise] = await tx
        .insert(merchandise)
        .values({
          title: title.trim(),
          price,
          description: description.trim(),
          category: category.trim(),
          tags: merchandiseTags,
          slug: merchandiseSlug,
          stock,
        })
        .returning();

      const merchandiseId = newMerchandise.id;

      await tx.insert(merchandiseColors).values({
        colors,
        merchandiseId,
      });

      await tx.insert(merchandiseImages).values({
        images,
        merchandiseId,
      });

      return newMerchandise;
    });

    return res.status(201).json({
      success: true,
      message: "New merchandise created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("addMerchandise error:", error);

    // Handle unique constraint violation (better than the manual check alone)
    if (error?.code === "23505") {
      // Postgres unique_violation
      return res.status(409).json({
        success: false,
        message: "Merchandise with this title already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
