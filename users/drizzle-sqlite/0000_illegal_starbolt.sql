CREATE TABLE `branch_counts` (
	`branch` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`sequence_count` text DEFAULT '0,0,0,0,0,0,0,0,0,0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `case_response` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`case_id` text NOT NULL,
	`pre_confidence` integer DEFAULT 0,
	`ai_suggestion` text,
	`reply_text` text,
	`post_confidence` integer DEFAULT 0,
	`post_stress` integer DEFAULT 0,
	`action_sequence` text
);
--> statement-breakpoint
CREATE TABLE `case_t` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`main_post` text,
	`replies` text,
	`case_type` text
);
--> statement-breakpoint
CREATE TABLE `submission` (
	`id` text PRIMARY KEY NOT NULL,
	`data_consent` integer,
	`debriefing_consent` integer,
	`branch` text DEFAULT 'not-set',
	`sequence` integer DEFAULT -1 NOT NULL,
	`pre_qs` text,
	`post_qs` text,
	`prolific_pid` text,
	`study_id` text,
	`session_id` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
