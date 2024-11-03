"use client";

import React, { useEffect, useState } from "react";
import LikertScale from "@/components/LikertScale";
import { PreQs, Submission } from "@/types";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

interface PreSurveyProps {
  userId: string;
  submissionId: string;
}

export default function PreSurvey({ userId, submissionId }: PreSurveyProps) {
  const router = useRouter();
  // State object for all question answers
  const [answers, setAnswers] = useState<PreQs>({
    age: 0,
    gender: "",
    experience: "",
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

  const handleChange = (field: string, value: string | number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    updateSubmission({ ...submission, preQs: answers });
    router.push(`/study/${userId}/${submissionId}/2`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Pre-Intervention Questions</h2>

      {/* Section 1: Participant demographic characteristics */}
      <div className="mb-12">
        <div className="mb-6">
          <label className="block font-semibold mb-2">Age:</label>
          <input
            type="number"
            value={answers.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your age"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Gender assigned at birth:</label>
          <select
            value={answers.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select...</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Prefer not to answer</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">What’s your experience with online peer-support?</label>
          <select
            value={answers.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Select...</option>
            <option value="none">No experience</option>
            <option value="<1 year">&lt;1 year</option>
            <option value=">=1 year">&gt;=1 year</option>
          </select>
        </div>
      </div>

      {/* Section 3: Self-efficacy (Sharma et al., 2023) */}
      <div className="mb-12">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Self-efficacy questions</h3>
          <LikertScale
            label="I am confident I can write helpful responses to support seeking posts from users."
            value={answers.selfEfficacy1}
            setValue={(value) => handleChange("selfEfficacy1", value)}
          />
          <LikertScale
            label="I am confident I can write good responses to support seeking posts from users."
            value={answers.selfEfficacy2}
            setValue={(value) => handleChange("selfEfficacy2", value)}
          />
          <LikertScale
            label="I am confident I can write empathetic responses to support seeking posts from users."
            value={answers.selfEfficacy3}
            setValue={(value) => handleChange("selfEfficacy3", value)}
          />
          <LikertScale
            label="I feel that I need help in writing my responses."
            value={answers.selfEfficacy4}
            setValue={(value) => handleChange("selfEfficacy4", value)}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Submit
      </button>
    </div>
  );
}
