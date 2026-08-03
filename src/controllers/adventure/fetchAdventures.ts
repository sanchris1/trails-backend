import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Request, Response } from "express";
import { adventure } from "../../db/schema.js";
import { db } from "../../index.js";

export async function fetchAdventures(req: Request, res: Response) {
  try {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      category,
      difficulty,
      page = "1",
      limit = "10",
    } = req.params as Record<string, string | undefined>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    //search
    if (search?.trim()) {
      const term = `%${search.trim()}`;
      conditions.push(
        or(
          ilike(adventure.title, term),
          ilike(adventure.shortDescription, term),
          ilike(adventure.description, term),
          ilike(adventure.location, term),
          ilike(adventure.category, term),
        ),
      );
    }

    if (category) conditions.push(eq(adventure.category, category));
    if (difficulty) conditions.push(eq(adventure.difficulty, difficulty));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allowedSortFields = ["createdAt", "title"] as const;
    const sortField = allowedSortFields.includes(sortBy as any)
      ? (sortBy as (typeof allowedSortFields)[number])
      : "createdAt";

    const orderBy =
      sortOrder === "asc"
        ? asc(adventure[sortField])
        : desc(adventure[sortField]);

    const [adventures, totalResult] = await Promise.all([
      db
        .select()
        .from(adventure)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(adventure)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: adventures,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      filters: {
        search: search ?? null,
        category: category ?? null,
        difficulty: difficulty ?? null,
        sortBy: sortField,
        sortOrder,
      },
    });
  } catch (error) {
    const messages =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({
      success: false,
      messages,
    });
  }
}
