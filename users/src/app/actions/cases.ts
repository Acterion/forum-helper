'use server';

import { sql } from '@vercel/postgres';
import { Case, CaseResponse } from "@/types";

export async function getCases() {
    const response = await sql`SELECT id FROM case_t;`;
    return response.rows.map(row => row.id);
}

export async function getCase(caseId: string) {
    if (!caseId) return null;
    const response = await sql`SELECT * FROM case_t WHERE id = ${caseId};`;
    const caseData = response.rows[0] as { id: string, mainPost: string, replies: string };
    
    return {
        id: caseData.id,
        mainPost: JSON.parse(caseData.mainPost),
        replies: JSON.parse(caseData.replies)
    } as Case;
}

export async function submitCase(caseRes: CaseResponse) {
    await sql`
        INSERT INTO case_response (
            id, caseId, submissionId, preConfidence, aiSuggestion, replyText, postConfidence, actionSequence
        ) VALUES (
            ${caseRes.id}, ${caseRes.caseId}, ${caseRes.submissionId}, ${caseRes.preConfidence},
            ${caseRes.aiSuggestion}, ${caseRes.replyText}, ${caseRes.postConfidence}, ${JSON.stringify(caseRes.actionSequence)}
        );
    `;
}
