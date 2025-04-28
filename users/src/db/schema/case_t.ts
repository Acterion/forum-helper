import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export const case_t = pgTable("case_t", {
  id: text("id").primaryKey(),
  mainPost: jsonb("main_post"),
  replies: jsonb("replies"),
});
