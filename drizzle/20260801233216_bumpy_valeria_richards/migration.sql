CREATE TYPE "payment_status_enum" AS ENUM('pending', 'partially_paid', 'paid', 'failed', 'refunded');--> statement-breakpoint
DROP INDEX "booking_participants_index";--> statement-breakpoint
ALTER TABLE "adventure" ADD COLUMN "default_capacity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "booking_participants" ADD COLUMN "booking_participants_id" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "booking_participants" ADD COLUMN "medical_notes" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_status" "payment_status_enum" DEFAULT 'pending'::"payment_status_enum";--> statement-breakpoint
ALTER TABLE "booking_participants" ADD PRIMARY KEY ("booking_participants_id");--> statement-breakpoint
ALTER TABLE "adventure" DROP COLUMN "participants";--> statement-breakpoint
ALTER TABLE "adventure" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "adventure" ALTER COLUMN "description" SET DATA TYPE text USING "description"::text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "bookings_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "total_amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expedition" ALTER COLUMN "expedition_id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "expedition" ALTER COLUMN "expedition_status" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_participants_booking_idx" ON "booking_participants" ("booking_id");