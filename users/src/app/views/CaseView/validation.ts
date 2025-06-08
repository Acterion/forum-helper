import { z } from "zod";

// Case response form validation
export const confidenceSchema = z.number().min(0).max(5, {
  message: "Please rate your confidence level",
});

export const stressSchema = z.number().min(0).max(5, {
  message: "Please rate your stress level",
});

export const replyTextSchema = z.string().refine(
  (text) => {
    const characterCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return characterCount >= 300 || wordCount >= 30;
  },
  {
    message: "Response must be either at least 300 characters or at least 30 words long",
  }
);

// Case step validation schemas
export const caseStep1Schema = z.object({
  confidence: z.number().min(1).max(5, {
    message: "Please rate your confidence level",
  }),
});

export const caseStep2Schema = z.object({
  replyText: replyTextSchema,
});

export const caseStep3Schema = z.object({
  postConfidence: z.number().min(1).max(5, {
    message: "Please rate your confidence level",
  }),
  postStress: z.number().min(1).max(5, {
    message: "Please rate your stress level",
  }),
});

// Complete case response validation
export const caseResponseFormSchema = z.object({
  preConfidence: z.number().min(1).max(5),
  replyText: replyTextSchema,
  postConfidence: z.number().min(1).max(5),
  postStress: z.number().min(1).max(5),
  aiSuggestion: z.string().optional(),
  actionSequence: z
    .array(
      z.object({
        action: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

// Case form validation functions
export function validateCaseStep1(data: unknown) {
  return caseStep1Schema.safeParse(data);
}

export function validateCaseStep2(data: unknown) {
  return caseStep2Schema.safeParse(data);
}

export function validateCaseStep3(data: unknown) {
  return caseStep3Schema.safeParse(data);
}

export function validateCaseResponseForm(data: unknown) {
  return caseResponseFormSchema.safeParse(data);
}

// Export individual field validators for real-time validation
export const fieldValidators = {
  confidence: confidenceSchema,
  stress: stressSchema,
  replyText: replyTextSchema,
} as const;
