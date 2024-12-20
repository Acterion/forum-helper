import PreSurvey from "@/views/PreSurvey";
import ThreadView from "@/views/CaseView/CaseView";
import PostSurvey from "@/views/PostSurvey";
import Complete from "@/components/Complete";

export default async function StudyPage({ params }: { params: Promise<{ submissionId: string; studyStep: string }> }) {
  const { submissionId, studyStep } = await params;
  return (
    <main className="container mx-auto p-6">
      {studyStep == "1" && <PreSurvey submissionId={submissionId} />}
      {studyStep == "2" && <ThreadView submissionId={submissionId} />}
      {studyStep == "3" && <PostSurvey submissionId={submissionId} />}
      {studyStep == "complete" && <Complete />}
    </main>
  );
}
