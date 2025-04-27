"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import ConsentForm from "@/components/ConsentForm";
import Loading from "@/components/Loading";
import type { Submission } from "@/types";

// This would be the content of your consent form
const DATA_CONSENT_TEXT = `[Your data processing consent form text here]

This document outlines how we collect, process, and store your data during this study.

...

By agreeing to this consent form, you acknowledge that you have read and understood the information provided and consent to the collection and processing of your data as described.`;

interface DataConsentProps {
  submissionId: string;
}

export default function DataConsent({ submissionId }: DataConsentProps) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  const handleAgree = async () => {
    await updateSubmission(submissionId, {});
    router.push(`/study/${submissionId}/1`);
  };

  const handleDisagree = () => {
    router.push(`/study/${submissionId}/disagree`);
  };

  return (
    <ConsentForm
      submission={submission}
      formText={DATA_CONSENT_TEXT}
      formTitle="Data Processing Consent Form"
      documentUrl="/api/download/data-consent"
      documentName="consent-form.docx"
      onAgree={handleAgree}
      onDisagree={handleDisagree}
    />
  );
}
