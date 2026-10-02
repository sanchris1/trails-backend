CREATE TABLE "mpesa_receipt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"booking_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"receipt_number" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mpesa_receipt" ADD CONSTRAINT "mpesa_receipt_booking_id_bookings_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("bookings_id");--> statement-breakpoint
ALTER TABLE "mpesa_receipt" ADD CONSTRAINT "mpesa_receipt_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");