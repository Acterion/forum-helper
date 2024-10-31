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

export type Submission = {
    id: string;
    userId: string;
    nda: boolean;
    preQs?: {
        demographics: string;
        age: number;
    }
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
    actionSequence: {action: string, value: string}[];
}
