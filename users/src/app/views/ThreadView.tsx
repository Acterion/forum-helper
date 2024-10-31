'use client';
import { useEffect, useState, useRef } from 'react';
import ProgressBar from '../components/ProgressBar';
import ForumPost from '../components/ForumPost';
import { Case, CaseResponse } from '@/types';
import LikertScale from '../components/LikertScale';
import { v6 as uuid } from 'uuid';
import { getCase, getCases, submitCase } from '@/actions/cases';
import { createAiResponse } from '@/actions/ai';
import Loading from '../components/Loading';
import Complete from '../components/Complete';
import LoadingDots from '@/components/LoadingDots';

interface ThreadViewProps {
    userId: string;
    submissionId: string;
}

const makeNewResponse = (caseId: string, submissionId: string): CaseResponse => ({
    id: uuid(),
    caseId,
    submissionId,
    preConfidence: 1,
    aiSuggestion: '',
    replyText: '',
    postConfidence: 1,
    actionSequence: []
});

export default function ThreadView({ submissionId }: ThreadViewProps) {
    //form states
    const [confidence, setConfidence] = useState(1);
    const [replyText, setReplyText] = useState('');
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [comment, setComment] = useState('');
    const [postConfidence, setPostConfidence] = useState(1);
    const [actionSequence, setActionSequence] = useState<{ action: string, value: string }[]>([]);

    //util states
    const [step, setStep] = useState(1);
    const [isComplete, setIsComplete] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    //case states
    const [casesList, setCasesList] = useState<string[]>([]);

    const [caseNumber, setCaseNumber] = useState(0);
    const [currentCaseId, setCurrentCaseId] = useState(casesList[0] ?? '');

    const [currentCase, setCurrentCase] = useState<Case | null>(null);

    //final response state
    const [response, setResponse] = useState(makeNewResponse(currentCaseId, submissionId));

    useEffect(() => { const fetchCases = async () => { 
        const cases = await getCases();
        setCasesList(cases);
        setCurrentCaseId(cases[caseNumber]) 
    }; fetchCases(); }, [caseNumber]); 

    useEffect(() => { const fetchCase = async () => { setCurrentCase(await getCase(currentCaseId)); }; fetchCase(); }, [currentCaseId]);
    
    if (!currentCase || casesList.length === 0) return (<Loading />);

    const handleAiAssist = async () => {
        if (replyText === '') alert('Please enter a response before using AI Assist');  
        setIsAiLoading(true);    
        const prompt = `
        Main post: ${JSON.stringify({author: currentCase.mainPost.author, content: currentCase.mainPost.content})}, 
        Thread replies: ${JSON.stringify(currentCase.replies.map(r => ({author: r.author, content: r.content})))}
        User's reply: ${replyText}
        `;
        createAiResponse(prompt).then((res) => {
            setAiSuggestion(res!); 
            setActionSequence([...actionSequence, {action: "ai-assist", value: res!}]);
            setIsAiLoading(false);
        });
        
    };
    
    const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyText(e.target.value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setActionSequence([...actionSequence, {action: "manual-edit", value: e.target.value}]);
        }, 500);
    }

    const handleNextStep = () => setStep(step + 1);
    const resetForms = () => {
        setStep(1);
        setConfidence(1);
        setResponse(makeNewResponse(currentCaseId, submissionId));
        setComment('');
        setPostConfidence(1);
        setActionSequence([]);
    };

    const handleNextCase = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(actionSequence);
        await submitCase({...response, caseId: currentCaseId, preConfidence: confidence, postConfidence, replyText, aiSuggestion, actionSequence});
        
        if (caseNumber < casesList.length - 1) {
            setCaseNumber(caseNumber + 1);
            setCurrentCaseId(casesList[caseNumber + 1]);
        }
        else {
            setIsComplete(true);
        }
        resetForms();
    };

  if (isComplete) {
    return (
     <Complete/>
    );
  }

  const progress = ((caseNumber + 1) / casesList.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 border rounded-lg space-y-4">
      <ProgressBar progress={progress} />
      <div>
        <h2 className="text-2xl font-bold mb-4">Forum Thread</h2>
        <ForumPost post={currentCase.mainPost} isMainPost={true} />
        <hr className="my-4" />
        {currentCase.replies.map((reply, index) => (
          <ForumPost key={index} post={reply} />
        ))}
      </div>
      <div className="border-t pt-12 space-y-4">
        {step === 1 && (
          <>
            <LikertScale label='Initial Confidence Level:' value={confidence} setValue={setConfidence} />
            <button onClick={handleNextStep} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-lg font-semibold">Write your response:</h3>
            <textarea
              value={replyText}
              onChange={(e) => handleReplyChange(e)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md text-gray-900"
              placeholder="Type your response here..."
            ></textarea>
            <button
              onClick={handleAiAssist}
              className="w-full py-2 mb-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 min-h-10 flex items-center justify-center"
            >
              {isAiLoading ? <LoadingDots/> : "Ask AI for help"}
            </button>
            {aiSuggestion && (
                <>
                    <textarea
                        value={aiSuggestion}
                        readOnly
                        className="w-full h-32 p-3 border border-gray-300 rounded-md text-gray-900"
                        placeholder="AI suggestion is going to be here">
                    </textarea>
                </>
            )}
            <button onClick={() => (replyText ? handleNextStep() : alert("Response can't be empty"))} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Proceed
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <LikertScale label='Post Confidence Level:' value={postConfidence} setValue={setPostConfidence} />
            <h3 className="text-lg font-semibold">Leave your thoughts/comments:</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-md"
              placeholder="Enter your comments here..."
            ></textarea>
            <button onClick={handleNextCase} className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {caseNumber === casesList.length - 1 ? "Finish" : "Next Case"}
            </button>
          </>
        )}
      </div>

    </div>
  );
}