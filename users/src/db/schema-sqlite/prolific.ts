import { sqliteTable, text } from "drizzle-orm/sqlite-core";
/**
 * Prolific table schema for storing participant data.
 * This table is used to track participant submissions and their statuses.
 */
export const prolific = sqliteTable("prolific", {
  submissionId: text("submission_id").primaryKey(),
  participantId: text("participant_id").notNull(),
  status: text("status"),
  customStudyTncsAcceptedAt: text("custom_study_tncs_accepted_at"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  reviewedAt: text("reviewed_at"),
  archivedAt: text("archived_at"),
  timeTaken: text("time_taken"),
  completionCode: text("completion_code"),
  totalApprovals: text("total_approvals"),
  gender: text("gender"),
  highestEducationLevelCompleted: text("highest_education_level_completed"),
  age: text("age"),
  sex: text("sex"),
  ethnicitySimplified: text("ethnicity_simplified"),
  countryOfBirth: text("country_of_birth"),
  countryOfResidence: text("country_of_residence"),
  nationality: text("nationality"),
  language: text("language"),
  studentStatus: text("student_status"),
  employmentStatus: text("employment_status"),
});
