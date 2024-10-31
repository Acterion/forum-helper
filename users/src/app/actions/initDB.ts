'use server';

import { sql } from '@vercel/postgres';

async function checkSchema() {
  // Define the expected tables and columns
  const expectedSchema = {
    user: ['id', 'email', 'last_login'],
    case_t: ['id', 'mainPost', 'replies'],
    submission: ['id', 'userId', 'nda', 'preQs', 'postQs'],
    case_response: [
      'id', 'submissionId', 'caseId', 'preConfidence', 'aiSuggestion', 
      'replyText', 'postConfidence', 'actionSequence'
    ]
  };

  // Check for each table and its columns in the database
  for (const [table, columns] of Object.entries(expectedSchema)) {
    // Check if the table exists
    const tableCheck = await sql`
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_name = ${table}
    `;

    if (tableCheck.rows.length === 0) return false; // Table does not exist

    // Check if each column exists in the table
    for (const column of columns) {
      const columnCheck = await sql`
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = ${table} AND column_name = ${column}
      `;
      if (columnCheck.rows.length === 0) return false; // Column does not exist
    }
  }

  // All tables and columns exist
  return true;
}

export default async function initDB() {
  console.log('Checking database schema...');

  // Check if tables already exist with the expected schema
  const schemaExists = await checkSchema();
  if (schemaExists) {
    console.log('Schema already exists. Skipping setup.');
    return;
  }

  console.log('Dropping tables...');

  // Drop tables individually
    await sql`DROP TABLE IF EXISTS "user";`;
    await sql`DROP TABLE IF EXISTS case_t;`;
    await sql`DROP TABLE IF EXISTS submission CASCADE;`;
    await sql`DROP TABLE IF EXISTS case_response;`;

    console.log('Creating tables...');

    // Create tables individually
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        user_id TEXT NOT NULL,
        nda BOOLEAN NOT NULL,
        pre_qs JSONB, -- JSON object for demographics and age
        post_qs JSONB -- JSON object for post survey questions
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
        action_sequence JSONB -- JSON array for action sequence
      );
    `;

    console.log('Inserting data...');

    // Insert initial data separately
    await sql`
      INSERT INTO "user" (id, email) VALUES ('xx1xx', 'test@test.com');
    `;

    await sql`
      INSERT INTO case_t (id, main_post, replies) VALUES (
        '1', 
        ${JSON.stringify({
          author: 'TechEnthusiast',
          avatar: 'https://i.pravatar.cc/40',
          content: 'What is the best way to learn React in 2023?',
          timestamp: '2 hours ago'
        })}::jsonb,
        ${JSON.stringify([
          {
            author: 'CodeMaster',
            avatar: 'https://i.pravatar.cc/40',
            content: 'I would recommend starting with the official React documentation and then building small projects.',
            timestamp: '1 hour ago'
          },
          {
            author: 'WebDevNewbie',
            avatar: 'https://i.pravatar.cc/40',
            content: 'I found online courses really helpful when I was learning React.',
            timestamp: '45 minutes ago'
          }
        ])}::jsonb
      );
    `;

  console.log('Database setup complete.');
}