"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubmission, updateSubmission } from "@/actions/submissions";
import ConsentForm from "@/components/ConsentForm";
import Loading from "@/components/Loading";
import type { Submission } from "@/types";

const DATA_CONSENT_TEXT = ` CONSENT TO PARTICIPATE

 in the study

Towards Digital Sustainability in Health Care: Developing Digital Health Products through Data-Driven User Insights - Study 2

You have been asked to participate in a research study conducted by Prof. Marzyeh Ghassemi from the EECS at the Massachusetts Institute of Technology (M.I.T.). The purpose of this study is to evaluate the user experience of writing answers to questions from other users in peer support forums. You were selected as a possible participant in this study because your sex is female, self-identified gender is woman, and you are older than 18 years old. You should read the information below, and ask questions about anything you do not understand, before deciding whether to participate.
Answering the survey is voluntary. You have the right not to answer any question, and to stop the study at any time or for any reason.
There should be no risk or potential discomfort from this study. You are free to withdraw at any point of the study, without having to give a reason, by contacting the research team. Withdrawing from the study will not affect you in any way. If you choose to withdraw from the study, all your data will be destroyed. 
You will be compensated for participating in the study according to the amount agreed on Prolific.
You will not be identified in any publications that may result from this research. Any information that is obtained in connection with this study and that can be identified with you will remain confidential and will be disclosed only with your permission or as required by law. In addition, your information may be reviewed by authorized MIT representatives to ensure compliance with MIT policies and procedures.
As part of your participation, we will collect certain personal information about you, including your Prolific ID number and all the demographic data that you provided to the platform that is available to us. There are no direct benefits to participating in the research. During the experiment, you will be randomly assigned to a group and shown posts from an online forum. You will then be asked to write a response to each post. The specific conditions of the task may vary between groups, but all participants will complete a similar activity. Some aspects of the research will only be disclosed to you after you complete the survey.


The purpose of the data collection is to investigate how large language models can improve text conversations in online forums. The information you provide will only be available to MIT. Identifiers might be removed from the identifiable private information. After such removal, the information could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from the subject or the legally authorized representative. Your anonymized data will be shared in aggregated form publicly.

The survey is expected to take no more than 30 minutes to complete. We plan to recruit up to 600 participants.

Your private information will be retained by the research team for at least three years in a protected storage. You have the right to withdraw your data from the study at any time. To do so, contact Dr. Danielly de Paula (danielly@mit.edu). If you withdraw from the study, no new information will be collected about you or from you by the study team.

If you feel you have been treated unfairly, or you have questions regarding your rights as a research subject, you may contact the Chairman of the Committee on the Use of Humans as Experimental Subjects, M.I.T., Room E25-143b, 77 Massachusetts Ave, Cambridge, MA 02139, phone 1-617-253-6787.

I understand the procedures described above. My questions have been answered to my satisfaction, and I agree to participate in this study. I have been given a copy of this form. By ticking "I confirm", you agree that you have read, understood, and agreed to this consent document. If you do not confirm, the survey will end.

MIT IRB Protocol: 2504001610
`;

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
    await updateSubmission({
      id: submissionId,
      dataConsent: true,
    });
    router.push(`/study/${submissionId}/1`);
  };

  const handleDisagree = async () => {
    await updateSubmission({
      id: submissionId,
      dataConsent: false,
    });
    window.location.href =
      process.env.PROLIFIC_REJECTION_URL || `https://app.prolific.com/submissions/complete?cc=CLAI1PZS`;
  };

  return (
    <ConsentForm
      submission={submission}
      formText={DATA_CONSENT_TEXT}
      formTitle="Data Processing Consent Form"
      documentUrl="https://drive.google.com/uc?export=download&id=1WdfZYeLk-DeajVXWVkStTTzta3gkwbVA"
      documentName="consent-form.docx"
      onAgree={handleAgree}
      onDisagree={handleDisagree}
    />
  );
}
