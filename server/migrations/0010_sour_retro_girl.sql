ALTER TABLE "two_factor_token" RENAME COLUMN "userId" TO "userID";--> statement-breakpoint
ALTER TABLE "two_factor_token" ALTER COLUMN "userID" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factor_token" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "two_factor_token" ADD CONSTRAINT "two_factor_token_userID_user_id_fk" FOREIGN KEY ("userID") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
