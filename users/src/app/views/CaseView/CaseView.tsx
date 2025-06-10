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
    submissionId,
  });

  const {
    formState,
    updateFormState,
    isAiLoading,
    isSubmitting,
    errors,
    handleAiAssist,
    handleReplyChange,
    handleStep0Submit,
    handleStep1Submit,
    handleStep2Submit,
    handleStep3Submit,
  } = useFormState({
    initialCaseId: currentCase?.id || "",
    submissionId,
    branch: branch || "not-set",
    currentCase,
    onNextCase: handleNextCase,
  });

  if (!currentCase) return <Loading />;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg space-y-4">
      <ProgressBar progress={progress} />

      {/* Forum Thread Display */}
      {formState.step !== 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Main Post Section */}
          <div className="bg-blue-50 border-b border-blue-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">Original Post</span>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">{currentCase.title}</h2>
            <ForumPost post={currentCase.mainPost} isMainPost={true} />
          </div>

          {/* Replies Section */}
          {currentCase.replies.length > 0 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Replies ({currentCase.replies.length})
                </span>
              </div>
              <div className="space-y-4">
                {currentCase.replies.map((reply, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <ForumPost post={reply} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Steps */}
      <div className="border-t border-gray-200 pt-8 space-y-6">
        {/* Step 0: Introduction */}
        {formState.step === 0 && branch === "branch-a" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-800 leading-relaxed space-y-4">
                <p className="text-lg font-medium text-gray-900">This survey has three parts.</p>

                <p className="text-lg font-medium text-gray-900">Right now, you are in the second part.</p>

                <p className="text-base text-gray-700">
                  On the next few pages, you&apos;ll be randomized to see five example conversations from an online
                  health forum focused on women&apos;s health. For each one, you will be asked to write a response to a
                  question posted by a user.{" "}
                  <span className="font-medium text-gray-900">
                    You will have the option to ask AI to help you improve your answer.
                  </span>
                </p>

                <p className="text-base text-gray-700">
                  Before writing your response, you will also be asked to rate how confident you feel in answering the
                  post. After writing your response, you will be asked to rate how confident you feel with your answer
                  and how stressful it was to write it.
                </p>

                <p className="text-base text-gray-700">
                  Please{" "}
                  <span className="font-medium text-gray-900">
                    don&apos;t use any outside resources to help with your answers
                  </span>{" "}
                  — we are interested in responses based on your experience and/or knowledge of the topic.
                </p>
              </div>
            </div>
            <form onSubmit={handleStep0Submit}>
              <button
                type="submit"
                className="w-full py-3 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Case Study
              </button>
            </form>
          </div>
        )}
        {formState.step === 0 && branch === "branch-b" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-800 leading-relaxed space-y-4">
                <p className="text-lg font-medium text-gray-900">This survey has three parts.</p>

                <p className="text-lg font-medium text-gray-900">Right now, you are in the second part.</p>

                <p className="text-base text-gray-700">
                  On the next few pages, you&apos;ll be randomized to see five example conversations from an online
                  health forum focused on women&apos;s health. For each one, you will be asked to write a response to a
                  question posted by a user.{" "}
                </p>

                <p className="text-base text-gray-700">
                  Before writing your response, you will also be asked to rate how confident you feel in answering the
                  post. After writing your response, you will be asked to rate how confident you feel with your answer
                  and how stressful it was to write it.
                </p>

                <p className="text-base text-gray-700">
                  Please{" "}
                  <span className="font-medium text-gray-900">
                    don&apos;t use any outside resources to help with your answers
                  </span>{" "}
                  — we are interested in responses based on your experience and/or knowledge of the topic.
                </p>
              </div>
            </div>
            <form onSubmit={handleStep0Submit}>
              <button
                type="submit"
                className="w-full py-3 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Start Case Study
              </button>
            </form>
          </div>
        )}

        {/* Step 1: Pre-confidence */}
        {formState.step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <LikertScale
              label="How confident do you feel in answering this post?"
              value={formState.confidence}
              setValue={(v) => updateFormState({ confidence: v })}
              options={confidenceScale}
              required
            />
            <button
              type="submit"
              className="w-full py-3 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Proceed
            </button>
          </form>
        )}

        {/* Step 2: Response Writing */}
        {formState.step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Write your response (min 30 words):</h3>
              <textarea
                value={formState.replyText}
                onChange={(e) => {
                  handleReplyChange(e);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                className="w-full p-4 border border-gray-300 rounded-md text-gray-900 text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            </div>

            {/* AI Assist Button (Branch A only) */}
            {branch === "branch-a" && (
              <button
                type="button"
                onClick={handleAiAssist}
                className="w-full py-3 text-base font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 min-h-12 flex items-center justify-center transition-colors border border-gray-300">
                {isAiLoading ? <LoadingDots /> : "Ask AI for help"}
              </button>
            )}

            {/* AI Suggestion Display */}
            {formState.aiSuggestion && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Suggestion:</h4>
                <textarea
                  value={formState.aiSuggestion}
                  readOnly
                  className="w-full p-4 border border-gray-300 rounded-md text-gray-900 text-base leading-relaxed bg-gray-50"
                  style={{ minHeight: "8rem", height: "auto", resize: "vertical" }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }
                  }}
                />
              </div>
            )}

            {/* Error display */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-red-800 font-medium mb-2">Please fix the following errors:</h3>
                <ul className="text-red-700 text-sm list-disc list-inside space-y-1">
                  {errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Proceed
            </button>
          </form>
        )}

        {/* Step 3: Post-confidence and Stress */}
        {formState.step === 3 && (
          <form onSubmit={handleStep3Submit} className="space-y-6">
            <LikertScale
              label="How confident do you feel with your answer?"
              value={formState.postConfidence}
              setValue={(v) => updateFormState({ postConfidence: v })}
              options={confidenceScale}
              required
            />
            <LikertScale
              label="How stressful did you feel when writing the answer to the post?"
              value={formState.postStress}
              setValue={(v) => updateFormState({ postStress: v })}
              options={stressScale}
              required
            />
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3">Any additional thoughts/comments (optional):</h3>
              <textarea
                value={formState.comment}
                onChange={(e) => updateFormState({ comment: e.target.value })}
                className="w-full h-32 p-4 border border-gray-300 rounded-md text-base leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your comments here..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-base font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? "Submitting..." : isLastCase ? "Finish" : "Next Case"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
