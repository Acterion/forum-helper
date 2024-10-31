'use server';

import { getDb } from "@/lib/db";
import { Submission } from "@/types";

export async function createSubmission(submission: Submission) {
    const db = await getDb();
    console.log(submission);
    await db.run(
        "INSERT INTO submission (id, userId, nda) VALUES (?, ?, ?)",
        [
            submission.id,
            submission.userId,
            submission.nda
        ]
    );
}