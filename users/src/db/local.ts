import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";

// Create SQLite database file in the project root
const dbPath = join(process.cwd(), "forum_study_local.db");
const sqlite = new Database(dbPath);

export const localDb = drizzle({ client: sqlite, casing: "snake_case" });
