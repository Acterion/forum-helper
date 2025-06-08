import { useState } from "react";
import { z } from "zod";
import { postQsSchema } from "@/schemas";
import { PostQs } from "@/types";

// Form validation schema for PostSurvey
const postQsFormSchema = postQsSchema;

// Validation functions
export function validatePostSurveyForm(data: unknown) {
  return postQsFormSchema.safeParse(data);
}

// Check if user failed the attention check (correct answer is 4)
export function checkAttentionCheckFailed(attentionCheck: number | null): boolean {
  return attentionCheck !== null && attentionCheck !== 1;
}

export function usePostSurveyForm() {
  const [answers, setAnswers] = useState<PostQs>({
    helpfulness: null,
    empathy: null,
    actionability: null,
    stress: null,
    intentionToAdopt: null,
    wantAIHelp: null,
    selfEfficacy1: null,
    selfEfficacy2: null,
    selfEfficacy3: null,
    selfEfficacy4: null,
    selfEfficacy5: null,
    selfEfficacy6: null,
    selfEfficacy7: null,
    attentionCheck: null,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string | number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const validationResult = validatePostSurveyForm(answers);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(
        (err: { path: (string | number)[]; message: string }) => `${err.path.join(".")}: ${err.message}`
      );
      setErrors(errorMessages);
      return null;
    }

    return validationResult.data;
  };

  const isAttentionCheckFailed = () => {
    return checkAttentionCheckFailed(answers.attentionCheck);
  };

  return {
    answers,
    setAnswers,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    validateForm,
    isAttentionCheckFailed,
  };
}
