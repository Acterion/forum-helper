"use server";

import { sql } from "@vercel/postgres";
import { Submission } from "@/types";

async function choseBranch() {
  const countsResult = await sql`SELECT branch, count FROM branch_counts WHERE branch IN ('branch-a','branch-b');`;
  const counts = countsResult.rows as { branch: string; count: number }[];
  const countA = counts.find((r) => r.branch === "branch-a")?.count ?? 0;
  const countB = counts.find((r) => r.branch === "branch-b")?.count ?? 0;
  let chosen: string;
  if (countA < countB) chosen = "branch-a";
  else if (countB < countA) chosen = "branch-b";
  else chosen = Math.random() < 0.5 ? "branch-a" : "branch-b";
  return chosen;
}

export async function createSubmission(submission: Omit<Submission, "branch" | "dataConsent" | "debriefingConsent">) {
  const branch = await choseBranch();
  await sql`UPDATE branch_counts SET count = count + 1 WHERE branch = ${branch};`;
  // insert submission with assigned branch
  await sql`
    INSERT INTO submission (id, prolific_pid, study_id, session_id, branch) 
    VALUES (
      ${submission.id}, 
      ${submission.prolific_pid || null}, 
      ${submission.study_id || null}, 
      ${submission.session_id || null},
      ${branch}
    );
  `;
}

export async function getSubmission(submissionId: string) {
  if (!submissionId) return null;
  const response = await sql`SELECT * FROM submission WHERE id = ${submissionId};`;
  const submissionData = response.rows[0] as {
    id: string;
    dataConsent: boolean;
    debriefingConsent: boolean;
    branch: string;
    pre_qs: object;
    post_qs: object;
    prolific_pid: string | null;
    study_id: string | null;
    session_id: string | null;
  };

  return {
    id: submissionData.id,
    dataConsent: submissionData.dataConsent,
    debriefingConsent: submissionData.debriefingConsent,
    branch: submissionData.branch,
    prolific_pid: submissionData.prolific_pid ?? undefined,
    study_id: submissionData.study_id ?? undefined,
    session_id: submissionData.session_id ?? undefined,
    preQs: submissionData.pre_qs,
    postQs: submissionData.post_qs,
  } as Submission;
}

// Define a type that requires 'id' but makes other fields partial
type UpdatableSubmission = Partial<Omit<Submission, "id">> & Pick<Submission, "id">;

export async function updateSubmission(submission: UpdatableSubmission) {
  const { id, ...updates } = submission; // Destructure id and the rest of the updates

  if (!id) {
    // This check is technically redundant due to the type, but good for runtime safety
    throw new Error("Submission ID is required for update.");
  }

  // Filter out undefined values, as they indicate the field should not be updated
  const updateEntries = Object.entries(updates).filter(([, value]) => value !== undefined);

  if (updateEntries.length === 0) {
    console.log("No fields provided for update.");
    return; // Nothing to update
  }

  // Map TypeScript keys to database column names and format values
  const setClauses = updateEntries
    .map(([key, value]) => {
      switch (key) {
        case "preQs":
          // Ensure value is not null before stringifying, handle potential null if needed
          return sql`pre_qs = ${value === null ? null : JSON.stringify(value)}::jsonb`;
        case "postQs":
          return sql`post_qs = ${value === null ? null : JSON.stringify(value)}::jsonb`;
        case "prolific_pid":
          // Assert value is string or null/undefined
          return sql`prolific_pid = ${(value as string) ?? null}`;
        case "study_id":
          return sql`study_id = ${(value as string) ?? null}`;
        case "session_id":
          return sql`session_id = ${(value as string) ?? null}`;
        case "dataConsent":
          // Assert value is boolean
          return sql`"dataConsent" = ${value as boolean}`; // Ensure column name is quoted if needed
        case "debriefingConsent":
          // Assert value is boolean
          return sql`"debriefingConsent" = ${value as boolean}`; // Ensure column name is quoted if needed
        case "branch":
          // Assert value is string
          return sql`branch = ${value as string}`;
        default:
          // Log a warning for keys present in the input but not handled
          console.warn(`Unsupported field for update: ${key}`);
          return null; // This clause will be filtered out
      }
    })
    .filter((clause): clause is NonNullable<typeof clause> => clause !== null); // Filter out nulls resulting from unsupported keys

  // Check if there are any valid clauses to apply
  if (setClauses.length === 0) {
    console.log("No valid fields to update after mapping.");
    return;
  }

  //call table update for each clause
  setClauses.forEach((clause) => {
    sql`UPDATE submission SET ${clause} WHERE id = ${id};`;
  });

  // Create one SQL statement with all the set clauses
  const setClause = setClauses.join(", ");

  // Execute the dynamic UPDATE statement
  await sql`
    UPDATE submission
    SET ${setClause}
    WHERE id = ${id};
  `;
}
