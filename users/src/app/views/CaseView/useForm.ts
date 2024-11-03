import { CaseResponse } from "@/types";
import { useState } from "react";
import { v6 as uuid } from "uuid";

export const makeNewResponse = (caseId: string, submissionId: string): CaseResponse => ({
  id: uuid(),
  caseId,
  submissionId,
  preConfidence: 1,
  aiSuggestion: "",
  replyText: "",
  postConfidence: 1,
  postStress: 1,
  actionSequence: [],
});

export const useFormState = (initialCaseId: string, submissionId: string) => {
  const [formState, setFormState] = useState({
    step: 1,
    confidence: 1,
    replyText: "",
    aiSuggestion: "",
    comment: "",
    postConfidence: 1,
    postStress: 1,
    actionSequence: [] as { action: string; value: string }[],
    response: makeNewResponse(initialCaseId, submissionId),
  });

  const updateFormState = (newState: Partial<typeof formState>) => {
    setFormState((prev) => ({ ...prev, ...newState }));
  };

  const resetForm = () => {
    setFormState({
      step: 1,
      confidence: 1,
      replyText: "",
      aiSuggestion: "",
      comment: "",
      postConfidence: 1,
      postStress: 1,
      actionSequence: [],
      response: makeNewResponse(initialCaseId, submissionId),
    });
  };

  const handleNextStep = () => updateFormState({ step: formState.step + 1 });

  return { formState, updateFormState, setFormState, resetForm, handleNextStep };
};
