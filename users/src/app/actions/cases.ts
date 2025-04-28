"use server";

import { db } from "@/db";
import { Case, CaseResponse, Post } from "@/types";
import { case_t, case_response } from "@/schema";
import { eq } from "drizzle-orm";

export async function getCases() {
  const rows = await db.select({ id: case_t.id }).from(case_t);
  return rows.map((r) => r.id);
}

export async function getCase(caseId: string) {
  if (!caseId) return null;
  const rows = await db
    .select({ id: case_t.id, mainPost: case_t.mainPost, replies: case_t.replies })
    .from(case_t)
    .where(eq(case_t.id, caseId))
    .limit(1);
  if (rows.length === 0) return null;
  const c = rows[0];
  return { id: c.id, mainPost: c.mainPost, replies: c.replies } as Case;
}

export async function submitCase(caseRes: CaseResponse) {
  console.log(caseRes);
  await db
    .insert(case_response)
    .values({
      ...caseRes,
    })
    .execute();
}

export async function deleteCaseResponse(caseId: string) {
  await db.delete(case_response).where(eq(case_response.caseId, caseId)).execute();
}

export async function deleteCaseResponses(submissionId: string) {
  await db.delete(case_response).where(eq(case_response.submissionId, submissionId)).execute();
}
