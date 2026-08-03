ALTER TABLE "expedition" ADD COLUMN "departure_time" date NOT NULL;--> statement-breakpoint
ALTER TABLE "expedition" ADD COLUMN "return_date" date;--> statement-breakpoint
ALTER TABLE "expedition" ADD COLUMN "return_time" date;--> statement-breakpoint
ALTER TABLE "expedition" DROP CONSTRAINT "expedition_guide_user_id_fkey", ADD CONSTRAINT "expedition_guide_user_id_fkey" FOREIGN KEY ("guide") REFERENCES "user"("id") ON DELETE CASCADE;