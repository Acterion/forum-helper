"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";
import { importAndInsertCases } from "@/tools/db/importCases";

async function checkSchema() {
  // Define the expected tables and columns
  const expectedSchema = {
    user: ["id", "email"],
    case_t: ["id", "main_post", "replies"],
    submission: [
      "id",
      "data_consent",
      "debriefing_consent",
      "branch",
      "pre_qs",
      "post_qs",
      "prolific_pid",
      "study_id",
      "session_id",
    ],
    case_response: [
      "id",
      "submission_id",
      "case_id",
      "pre_confidence",
      "ai_suggestion",
      "reply_text",
      "post_confidence",
      "post_stress",
      "action_sequence",
    ],
  };

  // Check for each table and its columns in the database
  for (const [table, columns] of Object.entries(expectedSchema)) {
    // Check if the table exists
    const tableCheck = await db.execute(sql`
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = ${table}
    `);

    if (tableCheck.rows.length === 0) {
      console.log(`${table} not found`);
      return false;
    }

    // Check if each column exists in the table
    for (const column of columns) {
      const columnCheck = await db.execute(sql`
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = ${column}
      `);
      if (columnCheck.rows.length === 0) {
        console.log(`${column} in ${table} not found`);
        return false;
      }
    }
  }

  // All tables and columns exist
  return true;
}

export default async function initDB() {
  console.log("Checking database schema...");
  await importAndInsertCases();

  // Check if tables already exist with the expected schema
  const schemaExists = await checkSchema();
  if (schemaExists) {
    console.log("Schema already exists. Skipping setup.");
    return;
  }

  // console.log('Dropping tables...');

  // // Drop tables individually
  // await sql`DROP TABLE IF EXISTS "user";`;
  // await sql`DROP TABLE IF EXISTS case_t;`;
  // await sql`DROP TABLE IF EXISTS submission CASCADE;`;
  // await sql`DROP TABLE IF EXISTS case_response;`;

  console.log("Creating tables...");

  // Create tables individually
  await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL
      );
    `;

  await sql`
      CREATE TABLE IF NOT EXISTS case_t (
        id TEXT PRIMARY KEY,
        main_post JSONB, 
        replies JSONB
      );
    `;

  await sql`
      CREATE TABLE IF NOT EXISTS submission (
        id TEXT PRIMARY KEY,
        data_consent BOOLEAN,
        debriefing_consent BOOLEAN,
        branch TEXT,
        pre_qs JSONB,
        post_qs JSONB,
        prolific_pid TEXT,
        study_id TEXT,
        session_id TEXT
      );
    `;

  await sql`
      CREATE TABLE IF NOT EXISTS case_response (
        id TEXT PRIMARY KEY,
        submission_id TEXT NOT NULL REFERENCES submission(id),
        case_id TEXT NOT NULL,
        pre_confidence INTEGER NOT NULL,
        ai_suggestion TEXT,
        reply_text TEXT,
        post_confidence INTEGER,
        post_stress INTEGER,
        action_sequence JSONB -- JSON array for action sequence
      );
    `;

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

  console.log("Database setup complete.");
  console.log("Importing cases...");
  await importAndInsertCases();
  console.log("Cases import complete.");
}
