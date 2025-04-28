"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import ConsentForm from "@/components/ConsentForm";
import Loading from "@/components/Loading";
import type { Submission } from "@/types";
import { deleteCaseResponses } from "@/actions/cases";

const DEBRIEFING_TEXT = `
Thank you for your participation in this research study.  For this study, it was important that we withhold some information from you about some aspects of the study.  Now that your participation is completed, we will describe the withheld information to you, why it was important, answer any of your questions, and provide you with the opportunity to decide on whether you would like to have your data included in this study.

What you should know about this study

(1) Description of Incomplete Disclosure:
Before the study, you were informed that you would be randomized to respond to peer support requests extracted from an online health forum. However, you were not initially told that you could be assigned to one of two groups: one group received assistance from an AI system when writing their responses, whereas the other did not. Additionally, you were told that the purpose of the study was to evaluate the user experience of writing answers to questions from other users in peer support forums. The actual purpose of the study was to assess the impact of receiving feedback or assistance from an artificial intelligence system on user experience and cognition when writing responses in peer support forums. Specifically, we examined how AI support may affect how participants feel during the response-writing process and how it influences their thought process, confidence, and perceived helpfulness of the response. We are now fully disclosing this information to ensure transparency. 

(2) Justification for Incomplete Disclosure:
This partial disclosure was necessary to preserve the validity of the study. Revealing the true purpose—specifically, the AI-assisted nature of the task —could have biased participants’ behavior and altered the quality or style of their responses. 

If you have questions
The main researcher conducting this study is Prof. Marzyeh Ghassemi from the EECS at the Massachusetts Institute of Technology (M.I.T.).  For any clarifications concerning the research, you may contact Dr. Danielly de Paula (danielly@mit.edu). If you have any questions or concerns regarding your rights as a research participant in this study, you may contact the Chairman of the Committee on the Use of Humans as Experimental Subjects, M.I.T., Room E25-143b, 77 Massachusetts Ave, Cambridge, MA 02139, phone 1-617-253-6787. 

Right to withdraw data 
You may choose to withdraw the data you provided before debriefing, without penalty or loss of benefits to which you are otherwise entitled.  Please indicate below if you do, or do not, give permission to have your data included in the study:
`;

interface DebriefingProps {
  submissionId: string;
}

export default function Debriefing({ submissionId }: DebriefingProps) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    getSubmission(submissionId).then((s) => setSubmission(s));
  }, [submissionId]);

  if (!submission) return <Loading />;

  const handleAgree = async () => {
    await updateSubmission({
      id: submissionId,
      debriefingConsent: true,
    });
    router.push(`/study/${submissionId}/complete`);
  };

  const handleDisagree = async () => {
    await updateSubmission({
      id: submissionId,
      debriefingConsent: false,
    });
    await deleteCaseResponses(submissionId);

    window.location.href =
      process.env.PROLIFIC_REJECTION_URL || `https://app.prolific.com/submissions/complete?cc=CLAI1PZS`;
  };

  return (
    <ConsentForm
      submission={submission}
      formText={DEBRIEFING_TEXT}
      formTitle="Debriefing Consent Form"
      documentUrl="https://drive.google.com/uc?export=download&id=1Y9bbE6wNUGyth4WKnvihvGA3UXpBQ67z"
      documentName="debriefing-form.docx"
      onAgree={handleAgree}
      onDisagree={handleDisagree}
    />
  );
}
