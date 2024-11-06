"use client";

import React, { useEffect, useState } from "react";
import LikertScale from "@/components/LikertScale";
import { PostQs, Submission } from "@/types";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

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
    selfEfficacy1: null,
    selfEfficacy2: null,
    selfEfficacy3: null,
    selfEfficacy4: null,
  });

  const [submission, setSubmission] = useState<Submission | null>(null);
  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  const handleChange = (field: string, value: number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.checkValidity();
    updateSubmission({ ...submission, postQs: answers });
    router.push(`/study/${submissionId}/complete`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Post-Intervention Survey</h2>
      <form onSubmit={handleSubmit}>
        {/* Section 1: User Experience */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">User Experience</h3>
          <LikertScale
            label="Feedback shown to me was helpful in improving my responses."
            value={answers.helpfulness}
            setValue={(value) => handleChange("helpfulness", value)}
          />
          <LikertScale
            label="Feedback shown to me was helpful in making my responses more empathic."
            value={answers.empathy}
            setValue={(value) => handleChange("empathy", value)}
          />
          <LikertScale
            label="Feedback shown to me was easy to incorporate into the final response."
            value={answers.actionability}
            setValue={(value) => handleChange("actionability", value)}
          />
          <LikertScale
            label="It was challenging or stressful to write responses to posts."
            value={answers.stress}
            setValue={(value) => handleChange("stress", value)}
          />
          <LikertScale
            label="I would like to see this type of feedback system deployed on online peer-support platforms."
            value={answers.intentionToAdopt}
            setValue={(value) => handleChange("intentionToAdopt", value)}
          />
        </div>

        {/* Section 2: Self-efficacy */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-4">Self-efficacy</h3>
          <LikertScale
            label="After this study, I am confident I can write helpful responses to support seeking posts from users."
            value={answers.selfEfficacy1}
            setValue={(value) => handleChange("selfEfficacy1", value)}
          />
          <LikertScale
            label="After this study, I am confident I can write good responses to support seeking posts from users."
            value={answers.selfEfficacy2}
            setValue={(value) => handleChange("selfEfficacy2", value)}
          />
          <LikertScale
            label="After this study, I am confident I can write empathetic responses to support seeking posts from users."
            value={answers.selfEfficacy3}
            setValue={(value) => handleChange("selfEfficacy3", value)}
          />
          <LikertScale
            label="After this study, I feel that I need help in writing my responses."
            value={answers.selfEfficacy4}
            setValue={(value) => handleChange("selfEfficacy4", value)}
          />
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
