'use server';

import { sql } from '@vercel/postgres';
import { Submission } from "@/types";

export async function createSubmission(submission: Submission) {
    console.log(submission);
    await sql`
        INSERT INTO submission (id, user_id, nda) 
        VALUES (${submission.id}, ${submission.userId}, ${submission.nda});
    `;
}

export async function getSubmission(submissionId: string) {
    if (!submissionId) return null;
    const response = await sql`SELECT * FROM submission WHERE id = ${submissionId};`;
    const submissionData = response.rows[0] as { id: string, user_id: string, nda: boolean, pre_qs: object, post_qs: object };
    
    return {
        id: submissionData.id,
        userId: submissionData.user_id,
        nda: submissionData.nda,
        preQs: submissionData.pre_qs,
        postQs: submissionData.post_qs
    } as Submission;
}

export async function updateSubmission(submission: Submission) {
    console.log(submission);
    await sql`
        UPDATE submission
        SET (nda, pre_qs, post_qs) = (${submission.nda}, ${JSON.stringify(submission.preQs)}::jsonb, ${JSON.stringify(submission.postQs)}::jsonb)
        WHERE id = ${submission.id};
    `;
}