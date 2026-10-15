import { Request, Response } from "express";
import { db } from "../../index.js";
import { bookings, user } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function fetchAllUsers(req: Request, res: Response) {
  try {
    const allUsers = await db
      .select({
        name: user.name,
        id: user.id,
        email: user.email,
        role: user.role,
        joined: user.createdAt,
        lastLogin: user.lastLoginAt,
        bookings: sql<number>`COUNT(${bookings.id})::int`,
      })
      .from(user)
      .leftJoin(bookings, eq(bookings.userId, user.id))
      .groupBy(
        user.name,
        user.id,
        user.role,
        user.createdAt,
        user.lastLoginAt,
        user.email,
      );

    return res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching all the users:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
