import { useState } from "react";
import { z } from "zod";
import { preQsSchema } from "@/schemas";
import { PreQs } from "@/types";
import { updateSubmission } from "@/actions/submissions";
import { deleteCaseResponses } from "@/actions/cases";
import { redirectToProlificFail } from "@/lib/prolific";

// Form validation schema with attention check
const preQsFormSchema = preQsSchema.refine(
  (data) => {
    // Attention check validation - must be "Strongly Disagree" (value 1)
    return data.attentionCheck === 1;
  },
  {
    message: "Please pay attention to the instructions",
    path: ["attentionCheck"],
  }
);

// Validation functions
export function validatePreSurveyForm(data: unknown) {
  return preQsFormSchema.safeParse(data);
}

export function usePreSurveyForm() {
  const [answers, setAnswers] = useState<PreQs>({
    frequency: "",
    selfEfficacy1: null,
    selfEfficacy2: null,
    selfEfficacy3: null,
    selfEfficacy4: null,
    selfEfficacy5: null,
    selfEfficacy6: null,
    selfEfficacy7: null,
    selfEfficacy8: null,
    attentionCheck: null,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAttentionDialog, setShowAttentionDialog] = useState(false);

  const handleChange = (field: string, value: string | number | null) => {
    if (field === "attentionCheck" && value !== 1) {
      setShowAttentionDialog(true);
    }

    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleAttentionDialogConfirm = () => {
    setShowAttentionDialog(false);
  };

  const handleAttentionDialogCancel = async (submissionId: string) => {
    // Reset the pending value and redirect to Prolific rejection URL
    setShowAttentionDialog(false);
    await updateSubmission({
      id: submissionId,
      debriefingConsent: false,
    });
    await deleteCaseResponses(submissionId);

    redirectToProlificFail();
  };

  const validateForm = () => {
    const validationResult = validatePreSurveyForm(answers);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(
        (err: { path: (string | number)[]; message: string }) => `${err.path.join(".")}: ${err.message}`
      );
      setErrors(errorMessages);
      return null;
    }

    return validationResult.data;
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
    showAttentionDialog,
    handleAttentionDialogConfirm,
    handleAttentionDialogCancel,
  };
}
