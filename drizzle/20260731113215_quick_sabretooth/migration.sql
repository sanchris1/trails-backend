CREATE TABLE "adventure" (
	"id" uuid PRIMARY KEY,
	"title" text NOT NULL,
	"description" varchar(255) NOT NULL,
	"short_description" varchar(255),
	"location" text NOT NULL,
	"duration" text NOT NULL,
	"default_price" integer NOT NULL,
	"participants" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"cover_image" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "adventure_id_index" ON "adventure" ("id");