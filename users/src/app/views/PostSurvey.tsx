"use client";

import React, { useEffect, useState } from "react";
import LikertScale from "@/components/LikertScale";
import { PostQs, Submission } from "@/types";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { agreementScale, confidenceScale, stressScale } from "@/static/scales";

interface PostSurveyProps {
  submissionId: string;
}

export default function PostSurvey({ submissionId }: PostSurveyProps) {
  const router = useRouter();
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
  });

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
        { key: "stress", label: "It was challenging or stressful to write responses to posts.", scale: stressScale },
      ];
  const selfEfficacyQuestions = [
    {
      key: "selfEfficacy1",
      label: "After the study, I am confident I can write relevant responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy2",
      label: "After the study, I am confident I can write complete responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy3",
      label: "After the study, I am confident I can write helpful responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy4",
      label: "After the study, I am confident I can write accurate responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy5",
      label: "After the study, I am confident I can write appropriate responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy6",
      label: "After the study, I am confident I can write clear responses to support seeking posts from users.",
      scale: confidenceScale,
    },
    {
      key: "selfEfficacy7",
      label: "After the study, I am confident I can write empathetic responses to support seeking posts from users.",
      scale: confidenceScale,
    },
  ];

  const handleChange = (field: string, value: number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check form validity first
    if (!e.currentTarget.checkValidity()) {
      // Find the first invalid field and scroll to it
      const firstInvalidField = e.currentTarget.querySelector(":invalid") as HTMLElement;
      if (firstInvalidField) {
        firstInvalidField.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        firstInvalidField.focus();
      }
      return;
    }

    updateSubmission({ ...submission, postQs: answers });
    router.push(`/study/${submissionId}/debriefing`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Post-Intervention Survey</h2>
      <form onSubmit={handleSubmit}>
        {/* Section 1: User Experience */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">User Experience{!isBranchA && " after the study"}</h3>
          {userExperienceQuestions.map((q) => (
            <LikertScale
              key={q.key}
              label={q.label}
              options={q.scale}
              value={answers[q.key as keyof PostQs]}
              setValue={(value) => handleChange(q.key, value)}
              required
            />
          ))}
        </div>

        {/* Section 2: Self-efficacy */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Self-efficacy after the study</h3>
          {selfEfficacyQuestions.map((q) => (
            <LikertScale
              key={q.key}
              label={q.label}
              options={q.scale}
              value={answers[q.key as keyof PostQs]}
              setValue={(value) => handleChange(q.key, value)}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Submit
        </button>
      </form>
    </div>
  );
}
