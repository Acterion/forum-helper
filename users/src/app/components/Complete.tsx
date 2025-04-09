"use client";

import { useEffect } from "react";
import Loading from "./Loading";

export default function Complete() {
  useEffect(() => {
    const prolificCompletionUrl =
      process.env.PROLIFIC_COMPLETION_URL || "https://app.prolific.com/submissions/complete?cc=C16GBRWH"; // Fallback URL

    console.log(prolificCompletionUrl);
    if (
      prolificCompletionUrl &&
      prolificCompletionUrl !== "https://app.prolific.com/submissions/complete?cc=C16GBRWH"
    ) {
      window.location.href = prolificCompletionUrl;
    } else {
      console.error("Prolific completion URL is not configured in environment variables (PROLIFIC_COMPLETION_URL).");
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redirecting back to Prolific...</h2>
      <p className="text-center text-gray-500">
        Please wait. If you are not redirected automatically, please ensure the completion URL is correctly configured
        or manually return to Prolific.
      </p>
      <Loading />
    </div>
  );
}
