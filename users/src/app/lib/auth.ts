"use server";

import { db } from "@/db";
import { user } from "@/schema";
import { eq } from "drizzle-orm";
import { User } from "@/types";

export async function checkUserEmail(email: string): Promise<User | null> {
  const results = await db.select().from(user).where(eq(user.email, email)).limit(1);
  return (results[0] as User) || null;
}
