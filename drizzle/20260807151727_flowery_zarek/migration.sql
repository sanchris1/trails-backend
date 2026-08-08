ALTER TABLE "expedition" DROP CONSTRAINT "expedition_guide_user_id_fkey";--> statement-breakpoint
ALTER TABLE "expedition" ADD COLUMN "guide_contact" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expedition" ALTER COLUMN "guide" SET NOT NULL;