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
    age: number;
    gender: 'male' | 'female' | 'other' | "";
    experience: 'none' | '<1 year' | '>=1 year' | ""
    selfEfficacy1: number | null;
    selfEfficacy2: number | null;
    selfEfficacy3: number | null;
    selfEfficacy4: number | null;
}

export type Submission = {
    id: string;
    userId: string;
    nda: boolean;
    preQs?: PreQs;
    postQs?: {
        q1: string;
        q2: string;
    }
}

export type CaseResponse = {
    id: string;
    submissionId: string;
    caseId: string;
    preConfidence: number;
    aiSuggestion: string;
    replyText: string;
    postConfidence: number;
    postStress: number;
    actionSequence: {action: string, value: string}[];
}
