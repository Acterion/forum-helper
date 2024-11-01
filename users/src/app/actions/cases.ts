'use server';

import { sql } from '@vercel/postgres';
import { Case, CaseResponse, Post } from "@/types";

export async function getCases() {
    const response = await sql`SELECT id FROM case_t;`;
    return response.rows.map(row => row.id);
}

export async function getCase(caseId: string) {
    if (!caseId) return null;
    const response = await sql`SELECT * FROM case_t WHERE id = ${caseId};`;
    const caseData = response.rows[0] as { id: string, main_post: Post, replies: Post[] };
    
    return {
        id: caseData.id,
        mainPost: caseData.main_post,
        replies: caseData.replies
    } as Case;
}

export async function submitCase(caseRes: CaseResponse) {
    console.log(caseRes);
    await sql`
        INSERT INTO case_response (
            id, case_id, submission_id, pre_confidence, ai_suggestion, reply_text, post_confidence, action_sequence
        ) VALUES (
            ${caseRes.id}, ${caseRes.caseId}, ${caseRes.submissionId}, ${caseRes.preConfidence},
            ${caseRes.aiSuggestion}, ${caseRes.replyText}, ${caseRes.postConfidence}, ${JSON.stringify(caseRes.actionSequence)}::jsonb
        );
    `;
}
