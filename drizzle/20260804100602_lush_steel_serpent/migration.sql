DROP INDEX "booking_participants_booking_idx";--> statement-breakpoint
CREATE INDEX "booking_participants_booking_idx" ON "booking_participants" ("booking_id");--> statement-breakpoint
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_email_key" UNIQUE("email");