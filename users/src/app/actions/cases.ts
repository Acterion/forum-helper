"use server";

import { db } from "@/db";
import {
  Case,
  CaseResponse,
  InsertCaseResponse,
  selectCaseResponseSchema,
  insertCaseResponseSchema,
  caseSchema,
  actionSequenceSchema,
} from "@/types";
import { case_t, case_response } from "../../db/schema";
import { eq } from "drizzle-orm";
import { validateJsonField } from "@/lib/validation";
import { title } from "process";

export async function getCases() {
  const rows = await db.select({ id: case_t.id }).from(case_t);
  return rows.map((r) => r.id);
}

export async function getCase(caseId: string) {
  if (!caseId) return null;
  const rows = await db
    .select({ id: case_t.id, mainPost: case_t.mainPost, replies: case_t.replies, title: case_t.title })
    .from(case_t)
    .where(eq(case_t.id, caseId))
    .limit(1);
  if (rows.length === 0) return null;
  const c = rows[0];

  // Validate the case data
  const caseData = { id: c.id, mainPost: c.mainPost, replies: c.replies, title: c.title };
  return caseSchema.parse(caseData);
}

export async function submitCase(caseRes: CaseResponse) {
  console.log(caseRes);

  // Validate the case response
  const validatedCaseRes: CaseResponse = selectCaseResponseSchema.parse(caseRes);

  // Validate the action sequence if it exists
  if (validatedCaseRes.actionSequence) {
    validateJsonField(actionSequenceSchema, validatedCaseRes.actionSequence, "actionSequence");
  }

  await db.insert(case_response).values(validatedCaseRes).execute();
}

export async function deleteCaseResponse(caseId: string) {
  await db.delete(case_response).where(eq(case_response.caseId, caseId)).execute();
}

export async function deleteCaseResponses(submissionId: string) {
  await db.delete(case_response).where(eq(case_response.submissionId, submissionId)).execute();
}
