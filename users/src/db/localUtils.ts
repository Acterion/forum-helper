import { localDb } from "./local";
import * as schema from "./schema-sqlite";
import { eq } from "drizzle-orm";

/**
 * Utility functions for working with the local SQLite database
 */

export class LocalDbUtil {
  static async getAllUsers() {
    return await localDb.select().from(schema.user);
  }

  static async getAllCases() {
    const cases = await localDb.select().from(schema.case_t);
    // Parse JSON strings back to objects
    return cases.map((c) => ({
      ...c,
      mainPost: c.mainPost ? JSON.parse(c.mainPost) : null,
      replies: c.replies ? JSON.parse(c.replies) : null,
    }));
  }

  static async getAllSubmissions() {
    const submissions = await localDb.select().from(schema.submission);
    // Parse JSON strings back to objects
    return submissions.map((s) => ({
      ...s,
      preQs: s.preQs ? JSON.parse(s.preQs) : null,
      postQs: s.postQs ? JSON.parse(s.postQs) : null,
    }));
  }

  static async getAllCaseResponses() {
    const caseResponses = await localDb.select().from(schema.case_response);
    // Parse JSON strings back to objects
    return caseResponses.map((cr) => ({
      ...cr,
      actionSequence: cr.actionSequence ? JSON.parse(cr.actionSequence) : null,
    }));
  }

  static async getAllBranchCounts() {
    const branchCounts = await localDb.select().from(schema.branch_counts);
    // Parse comma-separated string back to array
    return branchCounts.map((bc) => ({
      ...bc,
      sequenceCount: bc.sequenceCount ? bc.sequenceCount.split(",").map(Number) : new Array(10).fill(0),
    }));
  }

  static async getSubmissionWithResponses(submissionId: string) {
    const submission = await localDb
      .select()
      .from(schema.submission)
      .where(eq(schema.submission.id, submissionId))
      .limit(1);

    if (submission.length === 0) return null;

    const responses = await localDb
      .select()
      .from(schema.case_response)
      .where(eq(schema.case_response.submissionId, submissionId));

    return {
      submission: submission[0],
      responses: responses.map((r) => ({
        ...r,
        actionSequence: r.actionSequence ? JSON.parse(r.actionSequence) : null,
      })),
    };
  }

  static async getCaseById(caseId: string) {
    const cases = await localDb.select().from(schema.case_t).where(eq(schema.case_t.id, caseId)).limit(1);

    if (cases.length === 0) return null;

    const caseData = cases[0];
    return {
      ...caseData,
      mainPost: caseData.mainPost ? JSON.parse(caseData.mainPost) : null,
      replies: caseData.replies ? JSON.parse(caseData.replies) : null,
    };
  }

  static async getStats() {
    const userCount = await localDb.select().from(schema.user);
    const caseCount = await localDb.select().from(schema.case_t);
    const submissionCount = await localDb.select().from(schema.submission);
    const responseCount = await localDb.select().from(schema.case_response);
    const branchCount = await localDb.select().from(schema.branch_counts);

    return {
      users: userCount.length,
      cases: caseCount.length,
      submissions: submissionCount.length,
      responses: responseCount.length,
      branches: branchCount.length,
    };
  }
}

// Re-export the database instance and schema for direct access if needed
export { localDb } from "./local";
export * as localSchema from "./schema-sqlite";
