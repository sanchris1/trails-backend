import { and, arrayContains, asc, desc, eq, ilike } from "drizzle-orm";
import { Response, Request } from "express";
import {
  merchandise,
  merchandiseColors,
  merchandiseImages,
} from "../../db/schema.js";
import { db } from "../../index.js";
import { off } from "node:cluster";

export async function fetchMerchandise(req: Request, res: Response) {
  try {
    const {
      category,
      page = "1",
      limit = "12",
      search,
      sort = "newest",
      color,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);

    const limitNumber = Math.min(Math.max(Number(limit), 1), 60);

    const offset = (pageNumber - 1) * limitNumber;

    const conditions: any[] = [];

    if (search) {
      conditions.push(ilike(merchandise.title, `%${search}`));
      conditions.push(ilike(merchandise.category, `%${search}`));
      conditions.push(ilike(merchandise.description, `%${search}`));
      conditions.push(arrayContains(merchandiseColors.colors, [`%${search}`]));
    }

    if (color && typeof color === "string") {
      conditions.push(arrayContains(merchandiseColors.colors, [color]));
    }

    let orderBy;

    switch (sort) {
      case "newest":
        orderBy = asc(merchandise.createdAt);
        break;

      case "oldest":
        orderBy = desc(merchandise.createdAt);
        break;

      case "price_asc":
        orderBy = asc(merchandise.price);
        break;

      case "price_desc":
        orderBy = desc(merchandise.price);
        break;

      default:
        orderBy = asc(merchandise.createdAt);
        break;
    }

    const products = await db
      .select()
      .from(merchandise)
      .leftJoin(
        merchandiseColors,
        eq(merchandiseColors.merchandiseId, merchandise.id),
      )
      .leftJoin(
        merchandiseImages,
        eq(merchandiseImages.merchandiseId, merchandise.id),
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .offset(offset)
      .orderBy(orderBy)
      .limit(limitNumber);

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There are no products to display",
      });
    }

    return res.status(200).json({ data: products });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
