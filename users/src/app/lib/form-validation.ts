import { z } from "zod";

// This file now contains only shared validation utilities.
// Form-specific validation has been moved to colocated files:
// - PreSurvey validation: /views/PreSurvey/useForm.ts
// - PostSurvey validation: /views/PostSurvey/useForm.ts
// - CaseView validation: /views/CaseView/validation.ts

// Shared validation schemas that might be reused across forms
export const frequencySchema = z.enum(["Always", "Often", "Sometimes", "Occasionally", "Never"], {
  errorMap: () => ({ message: "Please select your forum usage frequency" }),
});

export const likertResponseSchema = z.number().min(1).max(5, {
  message: "Please select a valid response",
});
