import PreSurvey from "@/views/PreSurvey";
import ThreadView from "@/views/CaseView/CaseView";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ userId: string; submissionId: string; studyStep: string }>;
}) {
  const { userId, submissionId, studyStep } = await params;
  return (
    <main className="container mx-auto p-6">
      {studyStep == "1" && <PreSurvey submissionId={submissionId} userId={userId} />}
      {studyStep == "2" && <ThreadView submissionId={submissionId} userId={userId} />}
    </main>
  );
}
