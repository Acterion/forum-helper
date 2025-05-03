import PreSurvey from "@/views/PreSurvey";
import { getSubmission } from "@/actions/submissions";
import ThreadView from "@/views/CaseView/CaseView";
import PostSurvey from "@/views/PostSurvey";
import Complete from "@/views/Complete";
import { sequences } from "@/static/latinSquare";

export default async function StudyPage({ params }: { params: Promise<{ submissionId: string; studyStep: string }> }) {
  const { submissionId, studyStep } = await params;
  const submission = await getSubmission(submissionId);
  if (!submission) {
    return <div className="container mx-auto p-6">Submission not found</div>;
  }
  const branch = submission.branch;
  const sequence = sequences[submission.sequence];
  return (
    <main className="container mx-auto p-6">
      {studyStep == "1" && <PreSurvey submissionId={submissionId} />}
      {studyStep == "2" && <ThreadView submissionId={submissionId} branch={branch} sequence={sequence} />}
      {studyStep == "3" && <PostSurvey submissionId={submissionId} />}
      {studyStep == "complete" && <Complete />}
    </main>
  );
}
