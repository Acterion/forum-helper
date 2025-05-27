ALTER TABLE "case_response" ALTER COLUMN "pre_confidence" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "case_response" ALTER COLUMN "pre_confidence" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "case_response" ALTER COLUMN "post_confidence" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "case_response" ALTER COLUMN "post_stress" SET DEFAULT 0;