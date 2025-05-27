"use client";

import React, { useEffect, useState } from "react";
import LikertScale from "@/components/LikertScale";
import { PreQs, Submission } from "@/types";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

interface PreSurveyProps {
  submissionId: string;
}

export default function PreSurvey({ submissionId }: PreSurveyProps) {
  const router = useRouter();
  // State object for all question answers
  const [answers, setAnswers] = useState<PreQs>({
    frequency: "",
    selfEfficacy1: null,
    selfEfficacy2: null,
    selfEfficacy3: null,
    selfEfficacy4: null,
    selfEfficacy5: null,
    selfEfficacy6: null,
    selfEfficacy7: null,
    selfEfficacy8: null,
  });

  const [submission, setSubmission] = useState<Submission | null>(null);
  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  const handleChange = (field: string, value: string | number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.checkValidity();
    updateSubmission({ ...submission, preQs: answers });
    router.push(`/study/${submissionId}/2`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Pre-Intervention Questions</h2>
      <form onSubmit={handleSubmit}>
        {/* Frequency of online forum use */}
        <div className="mb-12">
          <div className="mb-6">
            <label className="block font-semibold mb-2">
              How often have you used online forums (like Reddit) in the past 12 months?
            </label>
            <select
              required
              value={answers.frequency}
              onChange={(e) => handleChange("frequency", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-gray-900">
              <option value="">Select...</option>
              <option value="Always">Always</option>
              <option value="Often">Often</option>
              <option value="Sometimes">Sometimes</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Never">Never</option>
            </select>
          </div>
        </div>

        {/* Self-efficacy */}
        <div className="mb-12">
          <div className="mb-6">
            <LikertScale
              label="I am confident I can write relevant responses to support seeking posts from users."
              value={answers.selfEfficacy1}
              setValue={(value) => handleChange("selfEfficacy1", value)}
            />
            <LikertScale
              label="I am confident I can write complete responses to support seeking posts from users."
              value={answers.selfEfficacy2}
              setValue={(value) => handleChange("selfEfficacy2", value)}
            />
            <LikertScale
              label="I am confident I can write helpful responses to support seeking posts from users."
              value={answers.selfEfficacy3}
              setValue={(value) => handleChange("selfEfficacy3", value)}
            />
            <LikertScale
              label="I am confident I can write accurate responses to support seeking posts from users."
              value={answers.selfEfficacy4}
              setValue={(value) => handleChange("selfEfficacy4", value)}
            />
            <LikertScale
              label="I am confident I can write appropriate responses to support seeking posts from users."
              value={answers.selfEfficacy5}
              setValue={(value) => handleChange("selfEfficacy5", value)}
            />
            <LikertScale
              label="I am confident I can write clear responses to support seeking posts from users."
              value={answers.selfEfficacy6}
              setValue={(value) => handleChange("selfEfficacy6", value)}
            />
            <LikertScale
              label="I am confident I can write empathetic responses to support seeking posts from users."
              value={answers.selfEfficacy7}
              setValue={(value) => handleChange("selfEfficacy7", value)}
            />
            <LikertScale
              label="I need help in writing my responses."
              value={answers.selfEfficacy8}
              setValue={(value) => handleChange("selfEfficacy8", value)}
            />
          </div>
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
