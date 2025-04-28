CREATE TABLE IF NOT EXISTS "branch_counts"  (
	"branch" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_response" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"case_id" text NOT NULL,
	"pre_confidence" integer NOT NULL,
	"ai_suggestion" text,
	"reply_text" text,
	"post_confidence" integer,
	"post_stress" integer,
	"action_sequence" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "case_t" (
	"id" text PRIMARY KEY NOT NULL,
	"main_post" jsonb,
	"replies" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission" (
	"id" text PRIMARY KEY NOT NULL,
	"data_consent" boolean,
	"debriefing_consent" boolean,
	"branch" text,
	"pre_qs" jsonb,
	"post_qs" jsonb,
	"prolific_pid" text,
	"study_id" text,
	"session_id" text
);
