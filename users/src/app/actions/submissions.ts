"use server";

import { db } from "@/db";
import {
  Submission,
  InsertSubmission,
  selectSubmissionSchema,
  insertSubmissionSchema,
  preQsSchema,
  postQsSchema,
} from "@/types";
import { submission, branch_counts } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { validateJsonField } from "@/lib/validation";

async function choseBranch() {
  const counts = await db.select({ branch: branch_counts.branch, count: branch_counts.count }).from(branch_counts);
  const countA = counts.find((r) => r.branch === "branch-a")?.count ?? 0;
  const countB = counts.find((r) => r.branch === "branch-b")?.count ?? 0;
  let chosen: "branch-a" | "branch-b";
  if (countA < countB) chosen = "branch-a";
  else if (countB < countA) chosen = "branch-b";
  else chosen = Math.random() < 0.5 ? "branch-a" : "branch-b";
  return chosen;
}

async function choseSequence(branch: "branch-a" | "branch-b") {
  const sequenceCounts = await db
    .select({ branch: branch_counts.branch, count: branch_counts.sequenceCount })
    .from(branch_counts)
    .where(eq(branch_counts.branch, branch));

  //find the index of the sequence.count with the lowest count
  const minIndex = sequenceCounts[0].count.findIndex((c: number) => c === Math.min(...sequenceCounts[0].count));

  return minIndex;
}

export async function createSubmission(
  sub: Omit<InsertSubmission, "branch" | "dataConsent" | "debriefingConsent" | "sequence">
) {
  await db
    .insert(submission)
    .values({
      id: sub.id,
      prolificPid: sub.prolificPid ?? null,
      studyId: sub.studyId ?? null,
      sessionId: sub.sessionId ?? null,
    })
    .execute();
}

export async function getSubmission(submissionId: string): Promise<Submission | null> {
  if (!submissionId) return null;
  const rows = await db.select().from(submission).where(eq(submission.id, submissionId)).limit(1);
  if (rows.length === 0) return null;
  const s = rows[0];

  if (s.branch === null || (s.branch !== "branch-a" && s.branch !== "branch-b" && s.branch !== "not-set")) {
    console.error(`Invalid or null branch value "${s.branch}" for submission ID:`, submissionId);
    return null;
  }

  // Validate and parse the JSON fields
  const validatedPreQs = s.preQs ? validateJsonField(preQsSchema, s.preQs, "preQs") : undefined;
  const validatedPostQs = s.postQs ? validateJsonField(postQsSchema, s.postQs, "postQs") : undefined;

  const submissionData = {
    id: s.id,
    dataConsent: s.dataConsent ?? undefined,
    debriefingConsent: s.debriefingConsent ?? undefined,
    branch: s.branch,
    sequence: s.sequence,
    prolificPid: s.prolificPid ?? undefined,
    studyId: s.studyId ?? undefined,
    sessionId: s.sessionId ?? undefined,
    preQs: validatedPreQs,
    postQs: validatedPostQs,
  };

  // Validate the entire submission object
  return selectSubmissionSchema.parse(submissionData);
}

export type UpdatableSubmission = Partial<Submission> & {
  id: string;
};

export async function updateSubmission(input: UpdatableSubmission) {
  const { id, ...rest } = input;

  // Validate the entire input first
  const validatedInput = selectSubmissionSchema.partial().extend({ id: selectSubmissionSchema.shape.id }).parse(input);

  // Validate nested JSON fields if they exist
  const processedRest: any = { ...rest };
  if (processedRest.preQs) {
    processedRest.preQs = validateJsonField(preQsSchema, processedRest.preQs, "preQs");
  }
  if (processedRest.postQs) {
    processedRest.postQs = validateJsonField(postQsSchema, processedRest.postQs, "postQs");
  }

  //Generate update object
  const data = Object.entries(processedRest).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      acc[key as keyof typeof acc] = value as any;
    }
    return acc;
  }, {} as Partial<typeof submission.$inferInsert>);

  if (Object.keys(data).length === 0) {
    console.log("No fields provided to update.");
    return;
  }

  await db.update(submission).set(data).where(eq(submission.id, validatedInput.id!)).execute();
}

export async function assignSubmissionBranch(submissionId: string) {
  const branch = await choseBranch();
  const sequence = await choseSequence(branch);

  const currentSequenceCount = await db
    .select({ branch: branch_counts.branch, count: branch_counts.sequenceCount })
    .from(branch_counts)
    .where(eq(branch_counts.branch, branch));

  const updatedSequenceCount = [...currentSequenceCount[0].count];
  updatedSequenceCount[sequence] += 1;

  await db
    .update(branch_counts)
    .set({
      count: sql`${branch_counts.count} + 1`,
      sequenceCount: updatedSequenceCount,
    })
    .where(eq(branch_counts.branch, branch))
    .execute();

  await db
    .update(submission)
    .set({
      branch: branch,
      sequence: sequence,
    })
    .where(eq(submission.id, submissionId))
    .execute();
}
