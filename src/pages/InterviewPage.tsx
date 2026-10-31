import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import Card from '@/components/Card';
import InterviewSession from '@/components/InterviewSession';
import { generateQuestions } from '@/services/api';
import { getSessionContext } from '@/services/sessionContext';
import type { InterviewQuestion } from '@/types/interview';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

const INTERVIEW_QUESTION_COUNT = 5;

export default function InterviewPage() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    const context = getSessionContext();
    if (!context) {
      setLoadState('error');
      setLoadError('Your session has expired. Please return to the prepare page to start again.');
      return;
    }

    setLoadState('loading');
    setLoadError(null);
    try {
      const data = await generateQuestions({
        sessionId: context.sessionId,
        jobTitle: context.jobTitle,
        jobDescription: context.jobDescription,
        resumeText: context.resumeText,
      });
      const interviewQuestions = data.slice(0, INTERVIEW_QUESTION_COUNT);
      if (interviewQuestions.length < INTERVIEW_QUESTION_COUNT) {
        setLoadState('error');
        setLoadError(`We could not load your full set of ${INTERVIEW_QUESTION_COUNT} questions. Please try again.`);
        return;
      }
      setQuestions(interviewQuestions);
      setLoadState('ready');
    } catch {
      setLoadState('error');
      setLoadError('We could not load your questions. Please check your connection and try again.');
    }
  }, []);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  if (loadState === 'ready') {
    return <InterviewSession questions={questions} />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="flex flex-col items-center gap-4 text-center">
        {loadState === 'loading' && (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <p className="text-base font-medium text-navy">Preparing your questions...</p>
          </>
        )}
        {loadState === 'error' && (
          <>
            <p className="text-base font-medium text-navy">
              {loadError ?? 'We could not load your questions.'}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => navigate('/prepare')}>Back to prepare</Button>
              <Button variant="secondary" onClick={loadQuestions}>Try again</Button>
            </div>
          </>
        )}
        {loadState === 'empty' && (
          <>
            <p className="text-base font-medium text-navy">No questions are ready yet.</p>
            <Button onClick={loadQuestions}>Try again</Button>
          </>
        )}
      </Card>
    </div>
  );
}
