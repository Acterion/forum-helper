import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from "@/lib/db";

async function main() {
  // create branch_counts table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS branch_counts (
      branch TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `;

  // seed initial counts
  await sql`
    INSERT INTO branch_counts (branch, count)
    VALUES
      ('branch-a', 0),
      ('branch-b', 0)
    ON CONFLICT DO NOTHING;
  `;

  console.log("branch_counts table initialized");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
