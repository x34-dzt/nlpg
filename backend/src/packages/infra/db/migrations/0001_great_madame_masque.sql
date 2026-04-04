ALTER TABLE "connections" ADD COLUMN "share_token" varchar(34);--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_shareToken_unique" UNIQUE("share_token");