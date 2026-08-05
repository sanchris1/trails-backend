CREATE TABLE "reviews" (
	"reviews_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"expedition_id" uuid NOT NULL,
	"rating" integer DEFAULT 1 NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_expedition_id_expedition_expedition_id_fkey" FOREIGN KEY ("expedition_id") REFERENCES "expedition"("expedition_id") ON DELETE CASCADE;