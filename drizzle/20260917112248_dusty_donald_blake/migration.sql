CREATE TYPE "notification_type" AS ENUM('inquiry', 'booking_created', 'booking_confirmed', 'booking_cancelled', 'payment_pending', 'payment_received', 'payment_failed', 'payment_reminder', 'expedition_reminder', 'expedition_updated', 'expedition_cancelled', 'system');--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"recipient_id" uuid NOT NULL,
	"sender_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"booking_id" uuid,
	"expedition_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
DROP TABLE "notifications";--> statement-breakpoint
CREATE INDEX "notification_recipient_idx" ON "notification" ("recipient_id");--> statement-breakpoint
CREATE INDEX "notification_sender_idx" ON "notification" ("sender_id");--> statement-breakpoint
CREATE INDEX "notification_booking_idx" ON "notification" ("booking_id");--> statement-breakpoint
CREATE INDEX "notification_expedition_idx" ON "notification" ("expedition_id");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" ("created_at");--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_user_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_sender_id_user_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_booking_id_bookings_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("bookings_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_expedition_id_expedition_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("expedition_id") ON DELETE CASCADE;--> statement-breakpoint
DROP TYPE "merchandise_sizes_enum";