import { CaseResponse, Case, Post, ActionSequence } from "@/types";
import { useState, useRef } from "react";
import { v6 as uuid } from "uuid";
import { createAiResponse } from "@/actions/ai";
import { submitCase } from "@/actions/cases";
import { validateCaseStep1, validateCaseStep2, validateCaseStep3, validateCaseResponseForm } from "./validation";

export const makeNewResponse = (caseId: string, submissionId: string): CaseResponse => ({
  id: uuid(),
  caseId,
  submissionId,
  preConfidence: 0,
  aiSuggestion: "",
  replyText: "",
  postConfidence: 0,
  postStress: 0,
  actionSequence: [],
});

interface UseFormStateProps {
  initialCaseId: string;
  submissionId: string;
  branch: string;
  currentCase: Case | null;
  onNextCase: () => Promise<void>;
}

export const useFormState = ({ initialCaseId, submissionId, branch, currentCase, onNextCase }: UseFormStateProps) => {
  const [formState, setFormState] = useState({
    step: 0,
    confidence: 0,
    replyText: "",
    aiSuggestion: "",
    comment: "",
    postConfidence: 0,
    postStress: 0,
    actionSequence: [] as { value: string; action: string; timestamp: string }[],
    response: makeNewResponse(initialCaseId, submissionId),
    showAIWarningDialog: false,
    aiDialogShown: false,
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateFormState = (newState: Partial<typeof formState>) => {
    setFormState((prev) => ({ ...prev, ...newState }));

    // Clear errors when user makes changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const resetForm = () => {
    setFormState({
      step: 1,
      confidence: 0,
      replyText: "",
      aiSuggestion: "",
      comment: "",
      postConfidence: 0,
      postStress: 0,
      actionSequence: [],
      response: makeNewResponse(initialCaseId, submissionId),
      showAIWarningDialog: false,
      aiDialogShown: false,
    });
  };

  // AI assistance handler
  const handleAiAssist = async () => {
    if (formState.replyText === "" || formState.replyText.trim().split(/\s+/).filter(Boolean).length < 30) {
      alert("Please enter a response longer than 30 words before using AI Assist");
      return;
    }
    if (branch !== "branch-a" || !currentCase) return;

    setIsAiLoading(true);
    const prompt = `
    **Main post:** ${JSON.stringify({
      author: currentCase.mainPost.author,
      content: currentCase.mainPost.content,
    })},
    **Thread replies:** ${JSON.stringify(
      currentCase.replies.map((r: Post) => ({ author: r.author, content: r.content }))
    )}
    **User's reply:** ${formState.replyText}
    `;

    const res = await createAiResponse(prompt);
    if (res) {
      updateFormState({
        aiSuggestion: res,
        actionSequence: [
          ...formState.actionSequence,
          { action: "ai-assist", value: res, timestamp: new Date().toISOString() },
        ],
      });
    }
    setIsAiLoading(false);
  };

  const handleAIDialogConfirm = () => {
    updateFormState({ showAIWarningDialog: false });
    handleAiAssist();
    updateFormState({
      actionSequence: [
        ...formState.actionSequence,
        { action: "ai-assist-confirmed", value: formState.aiSuggestion, timestamp: new Date().toISOString() },
      ],
    });
  };

  const handleAIDialogCancel = () => {
    updateFormState({ showAIWarningDialog: false, aiDialogShown: true });
    updateFormState({
      actionSequence: [
        ...formState.actionSequence,
        { action: "ai-assist-cancelled", value: formState.aiSuggestion, timestamp: new Date().toISOString() },
      ],
    });
  };

  // Reply text change handler with debouncing
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    updateFormState({ replyText: newValue });

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      updateFormState({
        actionSequence: [
          ...formState.actionSequence,
          { action: "manual-edit", value: newValue, timestamp: new Date().toISOString() },
        ],
      });
    }, 500);
  };

  // Step 0 form handler (case view introduction)
  const handleStep0Submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFormState({ step: 1 });
  };

  // Step 1 form handler (confidence rating)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationResult = validateCaseStep1({ confidence: formState.confidence });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
      setErrors(errorMessages);
      return;
    }

    updateFormState({ step: 2 });
  };

  // Step 2 form handler (response writing)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationResult = validateCaseStep2({ replyText: formState.replyText });

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => `${err.message}`);
      setErrors(errorMessages);

      const textarea = e.currentTarget.querySelector("textarea") as HTMLTextAreaElement;
      if (textarea) {
        textarea.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        textarea.focus();
      }
      return;
    }

    if (formState.aiSuggestion.length === 0 && !formState.aiDialogShown && branch === "branch-a") {
      updateFormState({
        showAIWarningDialog: true,
        actionSequence: [
          ...formState.actionSequence,
          { action: "no-ai-suggestion", value: formState.replyText, timestamp: new Date().toISOString() },
        ],
      });
      return;
    }

    updateFormState({ step: 3 });
  };

  // Step 3 form handler (final submission)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      // Validate step 3 data
      const step3ValidationResult = validateCaseStep3({
        postConfidence: formState.postConfidence,
        postStress: formState.postStress,
      });

      if (!step3ValidationResult.success) {
        const errorMessages = step3ValidationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`);
        setErrors(errorMessages);
        return;
      }

      // Validate complete case response
      const completeFormData = {
        preConfidence: formState.confidence,
        replyText: formState.replyText,
        postConfidence: formState.postConfidence,
        postStress: formState.postStress,
        aiSuggestion: formState.aiSuggestion,
        actionSequence: formState.actionSequence,
      };

      const responseValidationResult = validateCaseResponseForm(completeFormData);

      if (!responseValidationResult.success) {
        const errorMessages = responseValidationResult.error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        );
        setErrors(errorMessages);
        return;
      }

      // Submit the validated data
      await submitCase({
        ...formState.response,
        caseId: initialCaseId,
        preConfidence: formState.confidence,
        postConfidence: formState.postConfidence,
        postStress: formState.postStress,
        replyText: formState.replyText,
        aiSuggestion: formState.aiSuggestion,
        actionSequence: formState.actionSequence,
      });

      await onNextCase();
      resetForm();
    } catch (error) {
      console.error("Error submitting case:", error);
      setErrors(["An error occurred while submitting your response. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    updateFormState,
    setFormState,
    resetForm,
    isAiLoading,
    isSubmitting,
    errors,
    handleAiAssist,
    handleReplyChange,
    handleStep0Submit,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
    handleAIDialogConfirm,
    handleAIDialogCancel,
  };
};
