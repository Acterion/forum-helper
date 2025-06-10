"use client";

import { getSubmission, updateSubmission } from "@/actions/submissions";
import LikertScaleCard from "@/components/LikertScaleCard";
import Loading from "@/components/Loading";
import { redirectToProlificFail } from "@/lib/prolific";
import { agreementScale, confidenceScale, stressScale } from "@/static/scales";
import { PostQs, Submission } from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { usePostSurveyForm } from "./useForm";

interface PostSurveyProps {
  submissionId: string;
}

export default function PostSurvey({ submissionId }: PostSurveyProps) {
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
    isAttentionCheckFailed,
  } = usePostSurveyForm();

  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  const isBranchA = submission.branch === "branch-a";
  const userExperienceQuestions = isBranchA
    ? [
        {
          key: "helpfulness",
          label: "Feedback shown to me was helpful in improving my responses.",
          scale: agreementScale,
        },
        {
          key: "empathy",
          label: "Feedback shown to me was helpful in making my responses more empathic.",
          scale: agreementScale,
        },
        {
          key: "actionability",
          label: "Feedback shown to me was easy to incorporate into the final response.",
          scale: agreementScale,
        },
        { key: "stress", label: "It was challenging or stressful to write responses to posts.", scale: stressScale },
        {
          key: "intentionToAdopt",
          label: "I would like to see this type of feedback system deployed on online peer-support platforms.",
          scale: agreementScale,
        },
      ]
    : [
        {
          key: "wantAIHelp",
          label: "I would like to have had help from AI to improve my responses.",
          scale: agreementScale,
        },
        {
          key: "stress",
          label: "How stressful did you feel when writing the answer to the posts?",
          scale: stressScale,
        },
      ];
  const selfEfficacyQuestions = [
    {
      key: "selfEfficacy1",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **relevant** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy2",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **complete** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy3",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **helpful** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy4",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **accurate** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy5",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **appropriate** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy6",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **clear** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
    {
      key: "attentionCheck",
      label:
        "How much are you paying **considerate** attention to answering this survey (to confirm that you are paying attention, please select 'Strongly Disagree')?",
      scale: agreementScale,
    },
    {
      key: "selfEfficacy7",
      label:
        "Now that you have completed the study, how confident are you in your ability to write **empathetic** responses to posts from users seeking support in online forums?",
      scale: confidenceScale,
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      // Validate form data using the hook's validation function
      const validatedData = validateForm();

      if (!validatedData) {
        setIsSubmitting(false);
        return;
      }

      // Check if user failed attention check and redirect to Prolific
      if (isAttentionCheckFailed()) {
        // Update submission with current data before redirecting
        await updateSubmission({ ...submission, postQs: validatedData });
        // Redirect to Prolific
        redirectToProlificFail();
        return;
      }

      // Update submission with validated data
      await updateSubmission({ ...submission, postQs: validatedData });
      router.push(`/study/${submissionId}/debriefing`);
    } catch (error) {
      console.error("Error submitting post-survey:", error);
      setErrors(["An error occurred while submitting the form. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">Post-Intervention Survey</h2>

        {/* Introduction paragraph */}
        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="text-gray-800 leading-relaxed space-y-4">
            <p className="text-lg font-medium">This survey has three parts.</p>

            <p className="text-lg font-medium">Right now, you are in the third part.</p>

            <p className="text-base">
              In this section, we would like to know about your experience writing the responses. We are also interested
              in how confident you feel now about writing supportive responses in online forums after having completed
              this study.
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
          {/* Section 1: User Experience */}
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b border-blue-200 pb-3">
              User Experience{!isBranchA && " after the study"}
            </h3>
            {userExperienceQuestions.map((q) => (
              <LikertScaleCard
                key={q.key}
                label={q.label}
                options={q.scale}
                value={answers[q.key as keyof PostQs]}
                setValue={(value) => handleChange(q.key, value)}
                required
              />
            ))}
          </section>

          {/* Section 2: Self-efficacy */}
          <section className="bg-green-50 border border-green-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b border-green-200 pb-3">
              Self-efficacy after the study
            </h3>
            {selfEfficacyQuestions.map((q) => (
              <LikertScaleCard
                key={q.key}
                label={q.label}
                options={q.scale}
                value={answers[q.key as keyof PostQs]}
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
