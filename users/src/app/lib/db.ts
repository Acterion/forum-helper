'use serve'

import sqlite3, { Database } from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';

// Singleton to manage DB connection
let db: SQLiteDatabase<sqlite3.Database> | null = null;

export async function getDb() {
    if (!db) 
        db = await open({
        filename: './forum_study.db',
        driver: Database
        });
    return db;
    
}