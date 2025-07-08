import { getCase, getCases } from "@/actions/cases";
import { Case } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UseCaseStateProps {
  sequence: number[];
  submissionId: string;
}

export const useCaseState = ({ sequence, submissionId }: UseCaseStateProps) => {
  const [casesList, setCasesList] = useState<string[]>([]);
  const [caseNumber, setCaseNumber] = useState(0);
  const [currentCaseId, setCurrentCaseId] = useState("");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLastCase, setIsLastCase] = useState(false);
  const [aiWarningShown, setAiWarningShown] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      const cases = await getCases();
      setCasesList(cases);
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchCase = async () => {
      setCurrentCase(await getCase(casesList[sequence[caseNumber]]));
    };
    if (casesList.length) fetchCase();
  }, [caseNumber, casesList, sequence]);

  useEffect(() => {
    if (casesList.length) {
      setCurrentCaseId(currentCase?.id || "");
    }
  }, [currentCase, casesList.length]);

  useEffect(() => {
    setProgress(((caseNumber + 1) / casesList.length) * 100);
    if (caseNumber === casesList.length - 1) {
      setIsLastCase(true);
    }
  }, [caseNumber, casesList.length]);

  // Navigation handler for moving to next case or finishing
  const handleNextCase = async () => {
    if (caseNumber < casesList.length - 1) {
      setCaseNumber(caseNumber + 1);
    } else {
      router.push(`/study/${submissionId}/3`);
    }
  };

  return {
    casesList,
    caseNumber,
    setCaseNumber,
    currentCaseId,
    setCurrentCaseId,
    currentCase,
    progress,
    handleNextCase,
    isLastCase,
    aiWarningShown,
    setAiWarningShown,
  };
};
