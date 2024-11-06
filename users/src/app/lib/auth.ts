"use server";

import { sql } from "./db";
import { User } from "@/types";

export async function checkUserEmail(email: string): Promise<User | null> {
  const response = await sql`SELECT * FROM "user" WHERE email = ${email};`;
  return (response.rows[0] as User) || null;
}
