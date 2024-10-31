import sqlite3, { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

// Singleton to manage DB connection
let db: SQLiteDatabase<sqlite3.Database> | null = null;

async function getDb() {
    if (!db) 
        db = await open({
        filename: './forum_study.db',
        driver: Database
        });
    return db;
    
}

export default async function create(){
    const db = await getDb();
    console.log('Dropping tables...');

    db.exec(`
        DROP TABLE IF EXISTS submission;
        DROP TABLE IF EXISTS case_response;
        DROP TABLE IF EXISTS case_t;
        DROP TABLE IF EXISTS user;
      `);

    console.log('Creating tables...');
    await db.exec(`
        CREATE TABLE IF NOT EXISTS user (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS case_t (
            id TEXT PRIMARY KEY,
            mainPost TEXT, 
            replies TEXT
        );

        CREATE TABLE IF NOT EXISTS submission (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            nda BOOLEAN NOT NULL,
            preQs TEXT, -- JSON object for demographics and age
            postQs TEXT -- JSON object for post survey questions
        );

        CREATE TABLE IF NOT EXISTS case_response (
            id TEXT PRIMARY KEY,
            submissionId TEXT NOT NULL,
            caseId TEXT NOT NULL,
            preConfidence INTEGER NOT NULL,
            aiSuggestion TEXT,
            replyText TEXT,
            postConfidence INTEGER,
            actionSequence TEXT, -- JSON array for action sequence
            FOREIGN KEY (submissionId) REFERENCES submission(id)
        );
    `);

    console.log('Inserting data...');
    await db.exec(`
        INSERT INTO user (id, email) VALUES ('xx1xx', 'test@test.com');
    `);
    await db.exec(`
        INSERT INTO case_t (id, mainPost, replies) VALUES (
          '1', 
          '{
            "author": "TechEnthusiast",
            "avatar": "https://i.pravatar.cc/40",
            "content": "What is the best way to learn React in 2023?",
            "timestamp": "2 hours ago"
          }', 
          '[
            {
              "author": "CodeMaster",
              "avatar": "https://i.pravatar.cc/40",
              "content": "I would recommend starting with the official React documentation and then building small projects.",
              "timestamp": "1 hour ago"
            },
            {
              "author": "WebDevNewbie",
              "avatar": "https://i.pravatar.cc/40",
              "content": "I found online courses really helpful when I was learning React.",
              "timestamp": "45 minutes ago"
            }
          ]'
        );
      `);
    await db.close();
}

create();