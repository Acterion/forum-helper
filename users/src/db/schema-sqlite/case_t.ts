import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const case_t = sqliteTable("case_t", {
  id: text("id").primaryKey(),
  title: text("title"),
  mainPost: text("main_post"), // SQLite doesn't have native JSON, using TEXT
  replies: text("replies"), // SQLite doesn't have native JSON, using TEXT
  case_type: text("case_type"),
});
