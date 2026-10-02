import { eq } from "drizzle-orm";
import { user } from "../../db/schema.js";
import { db } from "../../index.js";

export async function getAdminId(): Promise<string> {
  try {
    const [adminUserId] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, "admin"))
      .limit(1);

    return adminUserId.id;
  } catch (error) {
    return "";
  }
}
