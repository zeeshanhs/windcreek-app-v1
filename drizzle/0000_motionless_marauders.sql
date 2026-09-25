CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`order_id` text,
	`scenario_id` text,
	`title` text NOT NULL,
	`equipment` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "chats_scenario_general_ck" CHECK("chats"."scenario_id" is null or "chats"."order_id" is null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chats_owner_order_uq` ON `chats` (`owner_id`,`order_id`);--> statement-breakpoint
CREATE INDEX `chats_owner_updated_idx` ON `chats` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `citation_pages` (
	`id` integer PRIMARY KEY NOT NULL,
	`document` text NOT NULL,
	`sheet` text NOT NULL,
	`page` integer NOT NULL,
	`image` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `demo_runtime` (
	`id` integer PRIMARY KEY NOT NULL,
	`clock` text NOT NULL,
	`next_order_number` integer NOT NULL,
	`next_sequence` integer NOT NULL,
	CONSTRAINT "demo_runtime_singleton_ck" CHECK("demo_runtime"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`area` text NOT NULL,
	`equipment` text
);
--> statement-breakpoint
CREATE TABLE `message_references` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`kind` text NOT NULL,
	`label` text NOT NULL,
	`locator` text,
	`citation_id` integer,
	`source_id` text,
	`order_id` text,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`citation_id`) REFERENCES `citation_pages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `source_records`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "message_references_target_ck" CHECK(("message_references"."kind" = 'citation' and "message_references"."citation_id" is not null and "message_references"."source_id" is null and "message_references"."order_id" is null) or ("message_references"."kind" = 'source' and "message_references"."citation_id" is null and "message_references"."source_id" is not null and "message_references"."order_id" is null) or ("message_references"."kind" in ('remark','status') and "message_references"."citation_id" is null and "message_references"."source_id" is null and "message_references"."order_id" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_references_message_ordinal_uq` ON `message_references` (`message_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`author` text NOT NULL,
	`status` text NOT NULL,
	`at` text,
	`display_time` text,
	`content_kind` text NOT NULL,
	`body_text` text,
	`rich_json` text,
	`speaker` text,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "messages_ordinal_ck" CHECK("messages"."ordinal" > 0),
	CONSTRAINT "messages_author_ck" CHECK("messages"."author" in ('user','assistant')),
	CONSTRAINT "messages_status_ck" CHECK("messages"."status" in ('sent','sending','failed')),
	CONSTRAINT "messages_content_ck" CHECK(("messages"."content_kind" = 'plain' and "messages"."body_text" is not null and "messages"."rich_json" is null) or ("messages"."content_kind" = 'rich' and "messages"."body_text" is null and "messages"."rich_json" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `messages_chat_ordinal_uq` ON `messages` (`chat_id`,`ordinal`);--> statement-breakpoint
CREATE UNIQUE INDEX `messages_id_chat_uq` ON `messages` (`id`,`chat_id`);--> statement-breakpoint
CREATE TABLE `operation_receipts` (
	`operation_id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`kind` text NOT NULL,
	`request_hash` text NOT NULL,
	`result_id` text NOT NULL,
	`secondary_id` text,
	`at` text NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `operation_receipts_actor_idx` ON `operation_receipts` (`actor_id`);--> statement-breakpoint
CREATE TABLE `order_events` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`kind` text NOT NULL,
	`actor_id` text NOT NULL,
	`at` text NOT NULL,
	`text` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_events_kind_ck" CHECK("order_events"."kind" in ('created','remark','closed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_events_order_ordinal_uq` ON `order_events` (`order_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `order_remarks` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`author_id` text NOT NULL,
	`at` text NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_remarks_ordinal_ck" CHECK("order_remarks"."ordinal" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_remarks_order_ordinal_uq` ON `order_remarks` (`order_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`issue_id` text NOT NULL,
	`location_id` text NOT NULL,
	`requester_id` text NOT NULL,
	`created_at` text NOT NULL,
	`status` text NOT NULL,
	`version` integer NOT NULL,
	`equipment` text,
	`closure_actor_id` text,
	`closure_at` text,
	`closure_note` text,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`closure_actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "orders_status_ck" CHECK("orders"."status" in ('open','closed')),
	CONSTRAINT "orders_version_ck" CHECK("orders"."version" > 0),
	CONSTRAINT "orders_closure_ck" CHECK(("orders"."status" = 'open' and "orders"."closure_actor_id" is null and "orders"."closure_at" is null and "orders"."closure_note" is null) or ("orders"."status" = 'closed' and "orders"."closure_actor_id" is not null and "orders"."closure_at" is not null and "orders"."closure_note" is not null))
);
--> statement-breakpoint
CREATE INDEX `orders_status_time_idx` ON `orders` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `orders_requester_time_idx` ON `orders` (`requester_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`message_id` text NOT NULL,
	`name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`description` text NOT NULL,
	`bytes` blob NOT NULL,
	FOREIGN KEY (`message_id`,`chat_id`) REFERENCES `messages`(`id`,`chat_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "photos_size_ck" CHECK("photos"."size" >= 0 and "photos"."size" <= 10485760),
	CONSTRAINT "photos_mime_ck" CHECK("photos"."mime_type" in ('image/png','image/jpeg'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photos_message_uq` ON `photos` (`message_id`);--> statement-breakpoint
CREATE INDEX `photos_chat_idx` ON `photos` (`chat_id`);--> statement-breakpoint
CREATE TABLE `scenario_followups` (
	`scenario_id` text NOT NULL,
	`ordinal` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`scenario_id`) REFERENCES `scenarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `scenario_followups_ordinal_uq` ON `scenario_followups` (`scenario_id`,`ordinal`);--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`ticket_summary` text NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seed_metadata` (
	`id` integer PRIMARY KEY NOT NULL,
	`version` integer NOT NULL,
	`installed_at` text NOT NULL,
	CONSTRAINT "seed_metadata_singleton_ck" CHECK("seed_metadata"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE `source_records` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `unknown_faults` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`message_id` text NOT NULL,
	`equipment` text NOT NULL,
	`code` text NOT NULL,
	`at` text NOT NULL,
	`photo_id` text,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`message_id`,`chat_id`) REFERENCES `messages`(`id`,`chat_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `unknown_faults_chat_idx` ON `unknown_faults` (`chat_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`initials` text NOT NULL,
	`role` text NOT NULL,
	`email` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);