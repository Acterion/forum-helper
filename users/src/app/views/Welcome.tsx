"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v6 } from "uuid";
import { createSubmission } from "@/actions/submissions";

export default function Welcome() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newSubmissionId = v6();
      await createSubmission({
        id: newSubmissionId,
        nda: true,
        branch: "b",
      });
      router.push(`/study/${newSubmissionId}/1`);
    } catch (err) {
      console.error("Start error", err);
      setError("An error occurred. Please try again later.");
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-8 rounded-md shadow-md w-full max-w-md border border-gray-300">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome!</h2>
        <a className="text-lg font-normal text-center mb-4">This is an interactive user experience study.</a>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Start Study
        </button>
      </form>
    </div>
  );
}
