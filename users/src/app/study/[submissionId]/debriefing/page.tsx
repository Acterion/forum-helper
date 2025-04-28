import Debriefing from "@/views/Debriefing";

export default async function DebriefingPage({ params }: { params: Promise<{ submissionId: string }> }) {
  return <Debriefing submissionId={(await params).submissionId} />;
}
