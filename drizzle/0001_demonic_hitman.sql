CREATE TABLE `demo_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `demo_sessions_user_idx` ON `demo_sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `reset_generation` (
	`id` integer PRIMARY KEY NOT NULL,
	`generation` integer NOT NULL,
	CONSTRAINT "reset_generation_singleton_ck" CHECK("reset_generation"."id" = 1)
);
