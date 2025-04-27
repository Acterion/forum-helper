import DataConsent from "@/views/DataConsent";

export default function DataConsentPage({ params }: { params: { submissionId: string } }) {
  return <DataConsent submissionId={params.submissionId} />;
}
