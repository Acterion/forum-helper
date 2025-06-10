import { time } from "console";
import { title } from "process";
import { z } from "zod";

// Zod schemas for the nested JSON objects
export const preQsSchema = z.object({
  frequency: z.enum(["", "Always", "Often", "Sometimes", "Occasionally", "Never"]),
  selfEfficacy1: z.number().min(1).max(5).nullable(),
  selfEfficacy2: z.number().min(1).max(5).nullable(),
  selfEfficacy3: z.number().min(1).max(5).nullable(),
  selfEfficacy4: z.number().min(1).max(5).nullable(),
  selfEfficacy5: z.number().min(1).max(5).nullable(),
  selfEfficacy6: z.number().min(1).max(5).nullable(),
  selfEfficacy7: z.number().min(1).max(5).nullable(),
  selfEfficacy8: z.number().min(1).max(5).nullable(),
  attentionCheck: z.number().min(1).max(5).nullable(),
});

export const postQsSchema = z.object({
  helpfulness: z.number().min(1).max(5).nullable(),
  empathy: z.number().min(1).max(5).nullable(),
  actionability: z.number().min(1).max(5).nullable(),
  stress: z.number().min(1).max(5).nullable(),
  intentionToAdopt: z.number().min(1).max(5).nullable(),
  wantAIHelp: z.number().min(1).max(5).nullable(),
  selfEfficacy1: z.number().min(1).max(5).nullable(),
  selfEfficacy2: z.number().min(1).max(5).nullable(),
  selfEfficacy3: z.number().min(1).max(5).nullable(),
  selfEfficacy4: z.number().min(1).max(5).nullable(),
  selfEfficacy5: z.number().min(1).max(5).nullable(),
  selfEfficacy6: z.number().min(1).max(5).nullable(),
  selfEfficacy7: z.number().min(1).max(5).nullable(),
  attentionCheck: z.number().min(1).max(5).nullable(),
});

export const actionSequenceItemSchema = z.object({
  action: z.string(),
  value: z.string(),
  timestamp: z.string(),
});

export const actionSequenceSchema = z.array(actionSequenceItemSchema);

// Basic schemas for other entities
export const postSchema = z.object({
  author: z.string(),
  avatar: z.string(),
  content: z.string(),
  timestamp: z.string(),
});

export const CaseType = {
  EMOTIONAL_SUPPORT_A: "Emotional Support - A",
  EMOTIONAL_SUPPORT_B: "Emotional Support - B",
  INSTRUCTIONAL_SUPPORT_C: "Instructional Support - C",
  INSTRUCTIONAL_SUPPORT_E: "Instructional Support - E",
  INSTRUCTIONAL_SUPPORT_F: "Instructional Support - F",
} as const;

export type CaseType = (typeof CaseType)[keyof typeof CaseType];

export const caseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  mainPost: postSchema,
  replies: z.array(postSchema),
  case_type: z
    .enum([
      CaseType.EMOTIONAL_SUPPORT_A,
      CaseType.EMOTIONAL_SUPPORT_B,
      CaseType.INSTRUCTIONAL_SUPPORT_C,
      CaseType.INSTRUCTIONAL_SUPPORT_E,
      CaseType.INSTRUCTIONAL_SUPPORT_F,
    ])
    .optional(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});

// Manual schemas for database entities
export const submissionSchema = z.object({
  id: z.string(),
  dataConsent: z.boolean().nullable().optional(),
  debriefingConsent: z.boolean().nullable().optional(),
  branch: z.enum(["branch-a", "branch-b", "not-set"]).nullable().default("not-set"),
  sequence: z.number().default(-1),
  preQs: preQsSchema.nullable().optional(),
  postQs: postQsSchema.nullable().optional(),
  prolificPid: z.string().nullable().optional(),
  studyId: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
});

export const insertSubmissionSchema = submissionSchema.partial().extend({
  id: z.string(),
});

export const selectSubmissionSchema = submissionSchema;

export const caseResponseSchema = z.object({
  id: z.string(),
  submissionId: z.string(),
  caseId: z.string(),
  preConfidence: z.number().min(0).max(5).nullable().optional(),
  aiSuggestion: z.string().nullable().optional(),
  replyText: z.string().nullable().optional(),
  postConfidence: z.number().min(0).max(5).nullable().optional(),
  postStress: z.number().min(0).max(5).nullable().optional(),
  actionSequence: actionSequenceSchema.nullable().optional(),
});

export const insertCaseResponseSchema = caseResponseSchema.partial().extend({
  id: z.string(),
  submissionId: z.string(),
  caseId: z.string(),
});

export const selectCaseResponseSchema = caseResponseSchema;

// Export inferred types
export type PreQs = z.infer<typeof preQsSchema>;
export type PostQs = z.infer<typeof postQsSchema>;
export type ActionSequenceItem = z.infer<typeof actionSequenceItemSchema>;
export type ActionSequence = z.infer<typeof actionSequenceSchema>;
export type Post = z.infer<typeof postSchema>;
export type Case = z.infer<typeof caseSchema>;
export type User = z.infer<typeof userSchema>;
export type Submission = z.infer<typeof selectSubmissionSchema>;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type CaseResponse = z.infer<typeof selectCaseResponseSchema>;
export type InsertCaseResponse = z.infer<typeof insertCaseResponseSchema>;
