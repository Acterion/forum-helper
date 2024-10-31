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

  // Drop tables if they exist
  await sql`
    DROP TABLE IF EXISTS submission;
    DROP TABLE IF EXISTS case_response;
    DROP TABLE IF EXISTS case_t;
    DROP TABLE IF EXISTS user;
  `;

  console.log('Creating tables...');

  // Create new tables
  await sql`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS case_t (
      id TEXT PRIMARY KEY,
      mainPost JSONB, 
      replies JSONB
    );

    CREATE TABLE IF NOT EXISTS submission (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      nda BOOLEAN NOT NULL,
      preQs JSONB, -- JSON object for demographics and age
      postQs JSONB -- JSON object for post survey questions
    );

    CREATE TABLE IF NOT EXISTS case_response (
      id TEXT PRIMARY KEY,
      submissionId TEXT NOT NULL REFERENCES submission(id),
      caseId TEXT NOT NULL,
      preConfidence INTEGER NOT NULL,
      aiSuggestion TEXT,
      replyText TEXT,
      postConfidence INTEGER,
      actionSequence JSONB -- JSON array for action sequence
    );
  `;

  console.log('Inserting data...');

  // Insert initial data
  await sql`
    INSERT INTO user (id, email) VALUES ('xx1xx', 'test@test.com');
  `;

  await sql`
    INSERT INTO case_t (id, mainPost, replies) VALUES (
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