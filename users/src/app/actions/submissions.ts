"use server";

import { sql } from "@/lib/db";
import { Submission } from "@/types";

export async function createSubmission(submission: Submission) {
  // assign user to branch-a or branch-b based on existing counts
  const countsResult = await sql`SELECT branch, count FROM branch_counts WHERE branch IN ('branch-a','branch-b');`;
  const counts = countsResult.rows as { branch: string; count: number }[];
  const countA = counts.find((r) => r.branch === "branch-a")?.count ?? 0;
  const countB = counts.find((r) => r.branch === "branch-b")?.count ?? 0;
  let chosen: string;
  if (countA < countB) chosen = "branch-a";
  else if (countB < countA) chosen = "branch-b";
  else chosen = Math.random() < 0.5 ? "branch-a" : "branch-b";
  // increment count for chosen branch
  await sql`UPDATE branch_counts SET count = count + 1 WHERE branch = ${chosen};`;
  // insert submission with assigned branch
  await sql`
    INSERT INTO submission (id, nda, prolific_pid, study_id, session_id, branch) 
    VALUES (
      ${submission.id}, 
      ${submission.nda}, 
      ${submission.prolific_pid || null}, 
      ${submission.study_id || null}, 
      ${submission.session_id || null},
      ${chosen}
    );
  `;
}

export async function getSubmission(submissionId: string) {
  if (!submissionId) return null;
  const response = await sql`SELECT * FROM submission WHERE id = ${submissionId};`;
  const submissionData = response.rows[0] as {
    id: string;
    nda: boolean;
    branch: string;
    pre_qs: object;
    post_qs: object;
    prolific_pid: string | null;
    study_id: string | null;
    session_id: string | null;
  };

  return {
    id: submissionData.id,
    nda: submissionData.nda,
    branch: submissionData.branch,
    prolific_pid: submissionData.prolific_pid ?? undefined,
    study_id: submissionData.study_id ?? undefined,
    session_id: submissionData.session_id ?? undefined,
    preQs: submissionData.pre_qs,
    postQs: submissionData.post_qs,
  } as Submission;
}

export async function updateSubmission(submission: Submission) {
  console.log(submission);
  await sql`
        UPDATE submission
        SET (nda, branch, pre_qs, post_qs) = (${submission.nda}, ${submission.branch}, ${JSON.stringify(
    submission.preQs
  )}::jsonb, ${JSON.stringify(submission.postQs)}::jsonb)
        WHERE id = ${submission.id};
    `;
}
