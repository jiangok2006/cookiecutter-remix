CREATE TABLE `access_tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`state` text,
	`access_token` text,
	`access_token_expires_at` integer,
	`refresh_token` text,
	`refresh_token_expires_at` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`uuid` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`data` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_tokens_email_provider_unique` ON `access_tokens` (`email`,`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);