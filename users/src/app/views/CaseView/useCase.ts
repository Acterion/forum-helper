import { getCase, getCases } from "@/actions/cases";
import { Case } from "@/types";
import { useEffect, useState } from "react";

export const useCaseState = () => {
  const [casesList, setCasesList] = useState<string[]>([]);
  const [caseNumber, setCaseNumber] = useState(0);
  const [currentCaseId, setCurrentCaseId] = useState("");
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchCases = async () => {
      const cases = await getCases();
      setCasesList(cases);
    };
    fetchCases();
  }, []);

  useEffect(() => {
    const fetchCase = async () => {
      console.log(casesList[caseNumber]);
      setCurrentCase(await getCase(casesList[caseNumber]));
    };
    if (casesList.length) fetchCase();
  }, [caseNumber, casesList]);

  useEffect(() => {
    setProgress(((caseNumber + 1) / casesList.length) * 100);
  }, [caseNumber, casesList]);

  return {
    casesList,
    caseNumber,
    setCaseNumber,
    currentCaseId,
    setCurrentCaseId,
    currentCase,
    progress,
  };
};
