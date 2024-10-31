'use server';

import { getDb } from "@/lib/db";
import { Case, CaseResponse } from "@/types";

export async function getCases() {
    const db = await getDb();
    const response = await db.all("SELECT (id) FROM case_t") as {id: string}[];
    return response.map(c => c.id);
}

export async function getCase(caseId: string) {
    if (!caseId) return null;
    const db = await getDb();
    const response = await db.get("SELECT * FROM case_t WHERE id = ?", [caseId]) as {id: string, mainPost: string, replies: string};
    return {id: response.id, mainPost: JSON.parse(response.mainPost), replies: JSON.parse(response.replies)} as Case;
}

export async function submitCase(caseRes: CaseResponse) {
    const db = await getDb();
    console.log(caseRes);
    await db.run(
        "INSERT INTO case_response (id, caseId, submissionId, preConfidence, aiSuggestion, replyText, postConfidence, actionSequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
            caseRes.id,
            caseRes.caseId,
            caseRes.submissionId,
            caseRes.preConfidence,
            caseRes.aiSuggestion,
            caseRes.replyText,
            caseRes.postConfidence,
            JSON.stringify(caseRes.actionSequence)
        ]
    );
}