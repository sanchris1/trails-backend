CREATE TYPE "role" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "user_role" "role" DEFAULT 'user'::"role";