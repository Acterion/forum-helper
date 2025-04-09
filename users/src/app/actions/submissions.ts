"use server";

import { sql } from "@/lib/db";
import { Submission } from "@/types";

export async function createSubmission(submission: Submission) {
  console.log(submission);
  await sql`
        INSERT INTO submission (id, nda, prolific_pid, study_id, session_id) 
        VALUES (
          ${submission.id}, 
          ${submission.nda}, 
          ${submission.prolific_pid || null}, 
          ${submission.study_id || null}, 
          ${submission.session_id || null}
        );
    `;
}

export async function getSubmission(submissionId: string) {
  if (!submissionId) return null;
  const response = await sql`SELECT * FROM submission WHERE id = ${submissionId};`;
  const submissionData = response.rows[0] as {
    id: string;
    nda: boolean;
    pre_qs: object;
    post_qs: object;
  };

  return {
    id: submissionData.id,
    nda: submissionData.nda,
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
