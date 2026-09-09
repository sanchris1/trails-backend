ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_key";--> statement-breakpoint
CREATE INDEX "booking_id_index" ON "bookings" ("bookings_id");