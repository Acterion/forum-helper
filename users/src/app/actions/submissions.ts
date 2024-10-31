'use server';

import { sql } from '@vercel/postgres';
import { Submission } from "@/types";

export async function createSubmission(submission: Submission) {
    console.log(submission);
    await sql`
        INSERT INTO submission (id, userId, nda) 
        VALUES (${submission.id}, ${submission.userId}, ${submission.nda});
    `;
}
