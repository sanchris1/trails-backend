ALTER TABLE "favorites" DROP CONSTRAINT "favorites_adventure_id_expedition_expedition_id_fkey";--> statement-breakpoint
ALTER TABLE "favorites" ADD COLUMN "expedition_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites" DROP COLUMN "adventure_id";--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_expedition_id_expedition_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("expedition_id") ON DELETE CASCADE;