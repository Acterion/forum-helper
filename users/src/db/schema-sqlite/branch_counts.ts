import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const branch_counts = sqliteTable("branch_counts", {
  branch: text("branch").primaryKey(),
  count: integer("count").notNull().default(0),
  sequenceCount: text("sequence_count").notNull().default("0,0,0,0,0,0,0,0,0,0"), // Store array as comma-separated string
});
