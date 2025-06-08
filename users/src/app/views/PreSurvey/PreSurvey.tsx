"use client";

import React, { useEffect, useState } from "react";
import LikertScaleCard from "@/components/LikertScaleCard";
import { Submission, PreQs } from "@/types";
import { getSubmission, updateSubmission, type UpdatableSubmission } from "@/actions/submissions";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { agreementScale, confidenceScale } from "@/static/scales";
import { usePreSurveyForm, validatePreSurveyForm } from "./useForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PreSurveyProps {
  submissionId: string;
}

export default function PreSurvey({ submissionId }: PreSurveyProps) {
  const router = useRouter();
  const {
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
  } = usePreSurveyForm();

  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  // Define questions in arrays for cleaner JSX
  const selfEfficacyQuestions = [
    {
      key: "selfEfficacy1",
      label:
        "How confident are you in your ability to write **relevant** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy2",
      label:
        "How confident are you in your ability to write **complete** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy3",
      label:
        "How confident are you in your ability to write **helpful** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy4",
      label:
        "How confident are you in your ability to write **accurate** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy5",
      label:
        "How confident are you in your ability to write **appropriate** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy6",
      label:
        "How confident are you in your ability to write **clear** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy7",
      label:
        "How confident are you in your ability to write **empathetic** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "attentionCheck",
      label:
        "How much are you paying **considerate** attention to answering this survey (to confirm that you are paying attention, please select 'Strongly Disagree)?",
      scale: agreementScale,
    },
    {
      key: "selfEfficacy8",
      label: "I need help with writing my responses.",
      scale: agreementScale,
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate form data using Zod schema
      const validationResult = validatePreSurveyForm(answers);

      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(
          (err: { path: (string | number)[]; message: string }) => `${err.path.join(".")}: ${err.message}`
        );
        setErrors(errorMessages);
        setIsSubmitting(false);
        return;
      }

      // Update submission with validated data
      await updateSubmission({ ...submission, preQs: validationResult.data });
      router.push(`/study/${submissionId}/2`);
    } catch (error) {
      console.error("Error submitting pre-survey:", error);
      setErrors(["An error occurred while submitting the form. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Pre-Intervention Questions</h2>

        {/* Introduction paragraph */}
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="text-gray-800 leading-relaxed space-y-4">
            <p className="text-lg font-medium">This survey has three parts.</p>

            <p className="text-lg font-medium">Right now, you are in the first part.</p>

            <p className="text-base">
              In this section, we would like to know about your experience using online forums to seek or share
              information. Moreover, we are interested in how confident you feel when it comes to writing supportive
              responses in these forums. By &quot;supportive,&quot; we refer to responses that are relevant, complete, helpful,
              accurate, appropriate, clear, and empathetic. Lastly, we would like to understand whether you feel you
              would need support when writing supportive responses.
            </p>
          </div>
        </div>

        {/* Error display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="text-red-700 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Frequency of online forum use */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b border-blue-200 pb-3">
              Background Information
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <label className="block text-lg font-medium mb-4 text-gray-800 leading-relaxed">
                How often have you used online forums (like Reddit) in the past 12 months?
              </label>
              <select
                required
                value={answers.frequency}
                onChange={(e) => handleChange("frequency", e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors duration-200">
                <option value="">Select...</option>
                <option value="Always">Always</option>
                <option value="Often">Often</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Occasionally">Occasionally</option>
                <option value="Never">Never</option>
              </select>
            </div>
          </section>

          {/* Self-efficacy */}
          <section className="bg-green-50 border border-green-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b border-green-200 pb-3">
              Self-Efficacy Assessment
            </h3>
            {selfEfficacyQuestions.map((q) => (
              <LikertScaleCard
                key={q.key}
                label={q.label}
                options={q.scale}
                value={answers[q.key as keyof PreQs] as number | null}
                setValue={(value) => handleChange(q.key, value)}
                required
              />
            ))}
          </section>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg">
              {isSubmitting ? "Submitting..." : "Continue to Study"}
            </button>
          </div>
        </form>

        {/* Attention Check Dialog */}
        <AlertDialog open={showAttentionDialog} onOpenChange={() => {}}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Please Pay Attention</AlertDialogTitle>
              <AlertDialogDescription>
                It seems you may not have read the instruction carefully. The instruction asks you to select
                &ldquo;Strongly Disagree&rdquo; for this specific question. Would you like to continue with the survey
                and pay closer attention to the instructions?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleAttentionDialogCancel(submissionId)}>
                No, exit survey
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleAttentionDialogConfirm}>Yes, I&apos;ll pay attention</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
