import { pgTable, text, jsonb } from "drizzle-orm/pg-core";
import { title } from "process";

export const case_t = pgTable("case_t", {
  id: text("id").primaryKey(),
  title: text("title"),
  mainPost: jsonb("main_post"),
  replies: jsonb("replies"),
  case_type: text("case_type"),
});
