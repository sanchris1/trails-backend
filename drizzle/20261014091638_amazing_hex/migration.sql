ALTER TABLE "reviews" ADD COLUMN "merchandise_id" uuid;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "expedition_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_merchandise_id_merchandise_merchandise_fkey" FOREIGN KEY ("merchandise_id") REFERENCES "merchandise"("merchandise") ON DELETE CASCADE;