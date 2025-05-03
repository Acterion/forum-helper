export interface User {
  id: string;
  email: string;
}

export type Post = {
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
};

export type Case = {
  id: string;
  mainPost: Post;
  replies: Post[];
};

export type PreQs = {
  frequency: "" | "Always" | "Often" | "Sometimes" | "Occasionally" | "Never";
  selfEfficacy1: number | null;
  selfEfficacy2: number | null;
  selfEfficacy3: number | null;
  selfEfficacy4: number | null;
  selfEfficacy5: number | null;
  selfEfficacy6: number | null;
  selfEfficacy7: number | null;
  selfEfficacy8: number | null;
};

export type PostQs = {
  helpfulness: number | null;
  empathy: number | null;
  actionability: number | null;
  stress: number | null;
  intentionToAdopt: number | null;
  wantAIHelp: number | null;
  selfEfficacy1: number | null;
  selfEfficacy2: number | null;
  selfEfficacy3: number | null;
  selfEfficacy4: number | null;
  selfEfficacy5: number | null;
  selfEfficacy6: number | null;
  selfEfficacy7: number | null;
};

export type Submission = {
  id: string;
  dataConsent?: boolean;
  debriefingConsent?: boolean;
  branch: "branch-a" | "branch-b";
  sequence: number;
  preQs?: PreQs;
  postQs?: PostQs;
  prolificPid?: string;
  studyId?: string;
  sessionId?: string;
};

export type CaseResponse = {
  id: string;
  submissionId: string;
  caseId: string;
  preConfidence: number;
  aiSuggestion: string;
  replyText: string;
  postConfidence: number;
  postStress: number;
  actionSequence: { action: string; value: string }[];
};
