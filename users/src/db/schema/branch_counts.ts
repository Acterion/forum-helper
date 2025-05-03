import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const branch_counts = pgTable("branch_counts", {
  branch: text("branch").primaryKey(),
  count: integer("count").notNull().default(0),
  sequenceCount: integer("sequence_count").array().notNull().default(new Array(10).fill(0)),
});
