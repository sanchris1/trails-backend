CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"expedition_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"caption" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "adventure" ADD COLUMN "cover_image_public_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery" ADD CONSTRAINT "gallery_expedition_id_expedition_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("expedition_id");