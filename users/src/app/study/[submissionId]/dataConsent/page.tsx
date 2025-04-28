import DataConsent from "@/views/DataConsent";

export default async function DataConsentPage({ params }: { params: Promise<{ submissionId: string }> }) {
  return <DataConsent submissionId={(await params).submissionId} />;
}
