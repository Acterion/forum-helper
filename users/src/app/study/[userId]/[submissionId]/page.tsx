import ThreadView from '@/components/ThreadView';

export default async function StudyPage({ params }: { params: Promise<{ userId: string, submissionId: string }> }) {
  const {userId, submissionId} = await params;
  return (
    <main className="container mx-auto p-6">
      <ThreadView submissionId={submissionId} userId={userId} />
    </main>
  );
}
