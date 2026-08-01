CREATE TYPE "booking_status_enum" AS ENUM('pending', 'cancelled', 'confirmed');--> statement-breakpoint
CREATE TYPE "expedition_status" AS ENUM('scheduled', 'ongoing', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "booking_participants" (
	"booking_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar NOT NULL,
	"emergency_contact" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"bookings_id" uuid PRIMARY KEY,
	"user_id" text,
	"expedition_id" uuid NOT NULL,
	"booking_status" "booking_status_enum" DEFAULT 'pending'::"booking_status_enum",
	"number_of_participants" integer DEFAULT 1,
	"total_amount" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expedition" (
	"expedition_id" uuid PRIMARY KEY,
	"adventure_id" uuid NOT NULL,
	"departure_date" date NOT NULL,
	"meeting_point" text NOT NULL,
	"guide" text,
	"expedition_status" "expedition_status" DEFAULT 'scheduled'::"expedition_status",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "adventure" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "adventure" ADD COLUMN "elevation_gain" integer;--> statement-breakpoint
CREATE INDEX "adventure_location_index" ON "adventure" ("location");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_participants_index" ON "booking_participants" ("booking_id");--> statement-breakpoint
CREATE INDEX "expedition_index" ON "expedition" ("expedition_id");--> statement-breakpoint
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_booking_id_bookings_bookings_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("bookings_id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_expedition_id_expedition_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("expedition_id");--> statement-breakpoint
ALTER TABLE "expedition" ADD CONSTRAINT "expedition_adventure_id_adventure_id_fkey" FOREIGN KEY ("adventure_id") REFERENCES "adventure"("id");--> statement-breakpoint
ALTER TABLE "expedition" ADD CONSTRAINT "expedition_guide_user_id_fkey" FOREIGN KEY ("guide") REFERENCES "user"("id");