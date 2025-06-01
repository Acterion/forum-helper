"use client";
import ProgressBar from "../../components/ProgressBar";
import ForumPost from "../../components/ForumPost";
import LikertScale from "../../components/LikertScale";
import Loading from "../../components/Loading";
import LoadingDots from "@/components/LoadingDots";
import { useFormState } from "./useForm";
import { useCaseState } from "./useCase";
import { Submission } from "@/types";
import { confidenceScale, stressScale } from "@/static/scales";

interface ThreadViewProps {
  submissionId: string;
  branch: Submission["branch"];
  sequence: number[];
}

export default function ThreadView({ submissionId, branch, sequence }: ThreadViewProps) {
  const { currentCase, progress, handleNextCase, isLastCase } = useCaseState({ 
    sequence, 
    submissionId 
  });

  const { 
    formState, 
    updateFormState,
    isAiLoading,
    handleAiAssist,
    handleReplyChange,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
  } = useFormState({ 
    initialCaseId: currentCase?.id || "", 
    submissionId, 
    branch,
    currentCase,
    onNextCase: handleNextCase,
  });

  if (!currentCase) return <Loading />;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg space-y-4">
      <ProgressBar progress={progress} />
      
      {/* Forum Thread Display */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Forum Thread</h2>
        <ForumPost post={currentCase.mainPost} isMainPost={true} />
        <hr className="my-4" />
        {currentCase.replies.map((reply, index) => (
          <ForumPost key={index} post={reply} />
        ))}
      </div>

      {/* Form Steps */}
      <div className="border-t pt-12 space-y-4">
        {/* Step 1: Pre-confidence */}
        {formState.step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <LikertScale
              label="How confident do you feel in answering this post?"
              value={formState.confidence}
              setValue={(v) => updateFormState({ confidence: v })}
              options={confidenceScale}
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </form>
        )}

        {/* Step 2: Response Writing */}
        {formState.step === 2 && (
          <form onSubmit={handleStep2Submit}>
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
              required
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
            />
            
            {/* AI Assist Button (Branch A only) */}
            {branch === "branch-a" && (
              <button
                type="button"
                onClick={handleAiAssist}
                className="w-full py-2 mb-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 min-h-10 flex items-center justify-center">
                {isAiLoading ? <LoadingDots /> : "Ask AI for help"}
              </button>
            )}
            
            {/* AI Suggestion Display */}
            {formState.aiSuggestion && (
              <textarea
                value={formState.aiSuggestion}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 mb-4"
                placeholder="AI suggestion is going to be here"
                style={{ minHeight: "8rem", height: "auto", resize: "vertical" }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
              />
            )}
            
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </form>
        )}

        {/* Step 3: Post-confidence and Stress */}
        {formState.step === 3 && (
          <form onSubmit={handleStep3Submit}>
            <LikertScale
              label="How confident do you feel with your answer?"
              value={formState.postConfidence}
              setValue={(v) => updateFormState({ postConfidence: v })}
              options={confidenceScale}
              required
            />
            <LikertScale
              label="How stressful it was to write an answer?"
              value={formState.postStress}
              setValue={(v) => updateFormState({ postStress: v })}
              options={stressScale}
              required
            />
            <h3 className="text-lg font-semibold">Leave your thoughts/comments:</h3>
            <textarea
              value={formState.comment}
              onChange={(e) => updateFormState({ comment: e.target.value })}
              className="w-full h-32 p-3 border border-gray-300 rounded-md"
              placeholder="Enter your comments here..."
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {isLastCase ? "Finish" : "Next Case"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
