import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const submission = sqliteTable("submission", {
  id: text("id").primaryKey(),
  dataConsent: integer("data_consent", { mode: "boolean" }),
  debriefingConsent: integer("debriefing_consent", { mode: "boolean" }),
  branch: text("branch").default("not-set"),
  sequence: integer("sequence").notNull().default(-1),
  preQs: text("pre_qs"), // SQLite doesn't have native JSON, using TEXT
  postQs: text("post_qs"), // SQLite doesn't have native JSON, using TEXT
  prolificPid: text("prolific_pid"),
  studyId: text("study_id"),
  sessionId: text("session_id"),
});
