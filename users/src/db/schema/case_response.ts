import { pgTable, text, integer, jsonb } from "drizzle-orm/pg-core";

export const case_response = pgTable("case_response", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  caseId: text("case_id").notNull(),
  preConfidence: integer("pre_confidence").notNull(),
  aiSuggestion: text("ai_suggestion"),
  replyText: text("reply_text"),
  postConfidence: integer("post_confidence"),
  postStress: integer("post_stress"),
  actionSequence: jsonb("action_sequence"),
});
