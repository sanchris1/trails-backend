import cron from "node-cron";
import { db } from "../index.js";
import { expedition } from "../db/schema.js";
import { and, gte, lte, eq, lt } from "drizzle-orm";

export function startExpeditionStatusJob() {
  cron.schedule("* * * * *", async () => {
    const now = new Date().toISOString().split("T")[0];

    await db
      .update(expedition)
      .set({ expeditionStatus: "ongoing" })
      .where(
        and(
          lte(expedition.departureDate, now),
          gte(expedition.returnDate, now),
          eq(expedition.expeditionStatus, "scheduled"),
        ),
      );

    await db
      .update(expedition)
      .set({ expeditionStatus: "completed" })
      .where(
        and(
          lt(expedition.returnDate, now),
          eq(expedition.expeditionStatus, "ongoing"),
        ),
      );
  });
}
