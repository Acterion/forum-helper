// Re-export types from schemas to maintain backward compatibility
export type {
  User,
  Post,
  Case,
  PreQs,
  PostQs,
  Submission,
  InsertSubmission,
  CaseResponse,
  InsertCaseResponse,
  ActionSequenceItem,
  ActionSequence,
} from "@/schemas";

// Re-export schemas for validation
export {
  userSchema,
  postSchema,
  caseSchema,
  preQsSchema,
  postQsSchema,
  selectSubmissionSchema,
  insertSubmissionSchema,
  selectCaseResponseSchema,
  insertCaseResponseSchema,
  actionSequenceSchema,
  actionSequenceItemSchema,
} from "@/schemas";
