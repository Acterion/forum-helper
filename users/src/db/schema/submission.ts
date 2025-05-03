import { pgTable, text, boolean, jsonb, integer } from "drizzle-orm/pg-core";

export const submission = pgTable("submission", {
  id: text("id").primaryKey(),
  dataConsent: boolean("data_consent"),
  debriefingConsent: boolean("debriefing_consent"),
  branch: text("branch").default("not-set"),
  sequence: integer("sequence").notNull().default(-1),
  preQs: jsonb("pre_qs"),
  postQs: jsonb("post_qs"),
  prolificPid: text("prolific_pid"),
  studyId: text("study_id"),
  sessionId: text("session_id"),
});
