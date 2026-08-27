CREATE TYPE "merchandise_sizes_enum" AS ENUM('Small', 'Medium', 'Large', 'XL', 'XXL', 'Custom');--> statement-breakpoint
CREATE TABLE "favorite_merchandise" (
	"favorite_merchandise_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchandise_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchandise" (
	"merchandise" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchandise_title" text NOT NULL,
	"merchandise_price" integer NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchandise_colors" (
	"merchandise_color_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchandise_color" text NOT NULL,
	"merchandise_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchandise_images" (
	"merchandise_images_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"merchandise_images" text[] DEFAULT '{}'::text[] NOT NULL,
	"merchandise_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE INDEX "favorite_merchandise_index" ON "favorite_merchandise" ("favorite_merchandise_id");--> statement-breakpoint
CREATE INDEX "merchandise_index" ON "merchandise" ("merchandise");--> statement-breakpoint
ALTER TABLE "favorite_merchandise" ADD CONSTRAINT "favorite_merchandise_wQ0zIOkVKjyq_fkey" FOREIGN KEY ("merchandise_id") REFERENCES "merchandise"("merchandise") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "favorite_merchandise" ADD CONSTRAINT "favorite_merchandise_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "merchandise_colors" ADD CONSTRAINT "merchandise_colors_merchandise_id_merchandise_merchandise_fkey" FOREIGN KEY ("merchandise_id") REFERENCES "merchandise"("merchandise") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "merchandise_images" ADD CONSTRAINT "merchandise_images_merchandise_id_merchandise_merchandise_fkey" FOREIGN KEY ("merchandise_id") REFERENCES "merchandise"("merchandise") ON DELETE CASCADE;