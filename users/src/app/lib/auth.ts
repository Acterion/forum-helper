'use server'

import { User } from '@/types';
import { getDb } from './db';

export async function checkUserEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.get<User>('SELECT * FROM user WHERE email = ?', [email]);
  return user || null;
}