import { CaseResponse, Case, Post } from "@/types";
import { useState, useRef } from "react";
import { v6 as uuid } from "uuid";
import { createAiResponse } from "@/actions/ai";
import { submitCase } from "@/actions/cases";

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
    step: 1,
    confidence: 0,
    replyText: "",
    aiSuggestion: "",
    comment: "",
    postConfidence: 0,
    postStress: 0,
    actionSequence: [] as { action: string; value: string }[],
    response: makeNewResponse(initialCaseId, submissionId),
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateFormState = (newState: Partial<typeof formState>) => {
    setFormState((prev) => ({ ...prev, ...newState }));
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
    });
  };

  // Form validation helper
  const validateForm = (form: HTMLFormElement): boolean => {
    if (!form.checkValidity()) {
      const firstInvalidField = form.querySelector(":invalid") as HTMLElement;
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        firstInvalidField.focus();
      }
      return false;
    }
    return true;
  }; // AI assistance handler
  const handleAiAssist = async () => {
    if (formState.replyText === "") {
      alert("Please enter a response before using AI Assist");
      return;
    }
    if (branch !== "branch-a" || !currentCase) return;

    setIsAiLoading(true);
    const prompt = `
    Main post: ${JSON.stringify({
      author: currentCase.mainPost.author,
      content: currentCase.mainPost.content,
    })},
    Thread replies: ${JSON.stringify(currentCase.replies.map((r: Post) => ({ author: r.author, content: r.content })))}
    User's reply: ${formState.replyText}
    `;

    const res = await createAiResponse(prompt);
    if (res) {
      updateFormState({
        aiSuggestion: res,
        actionSequence: [...formState.actionSequence, { action: "ai-assist", value: res }],
      });
    }
    setIsAiLoading(false);
  };

  // Reply text change handler with debouncing
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    updateFormState({ replyText: newValue });

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      updateFormState({
        actionSequence: [...formState.actionSequence, { action: "manual-edit", value: newValue }],
      });
    }, 500);
  };

  // Step 1 form handler (confidence rating)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    if (!validateForm(form)) return;

    updateFormState({ step: 2 });
  };

  // Step 2 form handler (response writing)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.replyText.trim()) {
      alert("Response can't be empty");
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

    updateFormState({ step: 3 });
  };

  // Step 3 form handler (final submission)
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;

    if (!validateForm(form)) return;

    await submitCase({
      ...formState.response,
      caseId: initialCaseId,
      preConfidence: formState.confidence,
      postConfidence: formState.postConfidence,
      replyText: formState.replyText,
      aiSuggestion: formState.aiSuggestion,
      actionSequence: formState.actionSequence,
    });

    await onNextCase();
    resetForm();
  };

  return {
    formState,
    updateFormState,
    setFormState,
    resetForm,
    isAiLoading,
    handleAiAssist,
    handleReplyChange,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
  };
};
