"use client";
import { useState, useRef } from "react";
import ProgressBar from "../../components/ProgressBar";
import ForumPost from "../../components/ForumPost";
import LikertScale from "../../components/LikertScale";
import { submitCase } from "@/actions/cases";
import { createAiResponse } from "@/actions/ai";
import Loading from "../../components/Loading";
import LoadingDots from "@/components/LoadingDots";
import { useFormState } from "./useForm";
import { useCaseState } from "./useCase";
import { useRouter } from "next/navigation";

interface ThreadViewProps {
  submissionId: string;
}

export default function ThreadView({ submissionId }: ThreadViewProps) {
  const { casesList, caseNumber, setCaseNumber, currentCaseId, setCurrentCaseId, currentCase, progress } =
    useCaseState();
  const { formState, updateFormState, resetForm, handleNextStep } = useFormState(currentCaseId, submissionId);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  if (!currentCase || casesList.length === 0) return <Loading />;

  const handleAiAssist = async () => {
    if (formState.replyText === "") {
      alert("Please enter a response before using AI Assist");
      return;
    }
    setIsAiLoading(true);
    const prompt = `
    Main post: ${JSON.stringify({
      author: currentCase.mainPost.author,
      content: currentCase.mainPost.content,
    })},
    Thread replies: ${JSON.stringify(currentCase.replies.map((r) => ({ author: r.author, content: r.content })))}
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

  const handleNextCase = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCase({
      ...formState.response,
      caseId: currentCaseId,
      preConfidence: formState.confidence,
      postConfidence: formState.postConfidence,
      replyText: formState.replyText,
      aiSuggestion: formState.aiSuggestion,
      actionSequence: formState.actionSequence,
    });

    if (caseNumber < casesList.length - 1) {
      setCaseNumber(caseNumber + 1);
      setCurrentCaseId(casesList[caseNumber + 1]);
    } else {
      router.push(`/study/${submissionId}/3`);
    }
    resetForm();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg space-y-4">
      <ProgressBar progress={progress} />
      <div>
        <h2 className="text-2xl font-bold mb-4">Forum Thread</h2>
        <ForumPost post={currentCase.mainPost} isMainPost={true} />
        <hr className="my-4" />
        {currentCase.replies.map((reply, index) => (
          <ForumPost key={index} post={reply} />
        ))}
      </div>
      <div className="border-t pt-12 space-y-4">
        {formState.step === 1 && (
          <>
            <LikertScale
              label="How confident do you feel in answering this post?"
              value={formState.confidence}
              setValue={(v) => updateFormState({ confidence: v })}
            />
            <button
              onClick={handleNextStep}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </>
        )}

        {formState.step === 2 && (
          <>
            <h3 className="text-lg font-semibold">Write your response:</h3>
            <textarea
              value={formState.replyText}
              onChange={(e) => {
                handleReplyChange(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
              placeholder="Type your response here..."
              style={{ minHeight: "8rem", height: "auto", resize: "vertical" }}
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}></textarea>
            <button
              onClick={handleAiAssist}
              className="w-full py-2 mb-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 min-h-10 flex items-center justify-center">
              {isAiLoading ? <LoadingDots /> : "Ask AI for help"}
            </button>
            {formState.aiSuggestion && (
              <>
                <textarea
                  value={formState.aiSuggestion}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900"
                  placeholder="AI suggestion is going to be here"
                  style={{ minHeight: "8rem", height: "auto", resize: "vertical" }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }
                  }}></textarea>
              </>
            )}
            <button
              onClick={() => (formState.replyText ? handleNextStep() : alert("Response can't be empty"))}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </>
        )}

        {formState.step === 3 && (
          <>
            <LikertScale
              label="How confident do you feel with your answer?"
              value={formState.postConfidence}
              setValue={(v) => updateFormState({ postConfidence: v })}
            />
            <LikertScale
              label="How stressful it was to write an answer?"
              value={formState.postStress}
              setValue={(v) => updateFormState({ postStress: v })}
            />
            <h3 className="text-lg font-semibold">Leave your thoughts/comments:</h3>
            <textarea
              value={formState.comment}
              onChange={(e) => updateFormState({ comment: e.target.value })}
              className="w-full h-32 p-3 border border-gray-300 rounded-md"
              placeholder="Enter your comments here..."></textarea>
            <button
              onClick={handleNextCase}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {caseNumber === casesList.length - 1 ? "Finish" : "Next Case"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
