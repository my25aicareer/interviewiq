import { ArrowRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/Badge';
import type { BadgeTone } from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import DeliveryStatsCard from '@/components/DeliveryStatsCard';
import FeedbackPanel from '@/components/FeedbackPanel';
import ProgressBar from '@/components/ProgressBar';
import QuestionTimer from '@/components/QuestionTimer';
import Toast from '@/components/Toast';
import VoiceInput from '@/components/VoiceInput';
import { evaluateAnswer } from '@/services/api';
import { getSessionContext, setInterviewResults } from '@/services/sessionContext';
import { recordPractice } from '@/services/streak';
import type {
  AnswerFeedback,
  DeliveryStats,
  Difficulty,
  InterviewQuestion,
  InterviewResult,
  QuestionCategory,
} from '@/types/interview';
import { computeDeliveryStats, countWords, resolveInputMethod } from '@/utils/deliveryStats';
import { TIME_LIMIT_SECONDS } from '@/utils/interviewTiming';

const categoryTone: Record<QuestionCategory, BadgeTone> = {
  'Resume-based': 'blue',
  Technical: 'slate',
  Behavioural: 'emerald',
  Situational: 'amber',
  'Career Motivation': 'blue',
};

const difficultyTone: Record<Difficulty, BadgeTone> = {
  Easy: 'emerald',
  Medium: 'amber',
  Hard: 'red',
};

const textareaClass =
  'w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-base leading-normal text-navy shadow-sm placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-500';

type Phase = 'answering' | 'evaluating' | 'feedback';

function appendTranscript(current: string, transcript: string) {
  if (!current) return transcript;
  return /\s$/.test(current) ? `${current}${transcript}` : `${current} ${transcript}`;
}

interface InterviewSessionProps {
  questions: InterviewQuestion[];
}

export default function InterviewSession({ questions }: InterviewSessionProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [phase, setPhase] = useState<Phase>('answering');
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [usedVoice, setUsedVoice] = useState(false);
  const [usedTyping, setUsedTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [results, setResults] = useState<InterviewResult[]>([]);

  const dismissToast = useCallback(() => setToastMessage(null), []);

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const timeLimitSeconds = TIME_LIMIT_SECONDS[current.difficulty];
  const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
  const isTimeUp = !isPracticeMode && phase === 'answering' && remainingSeconds === 0 && !isTimedOut;
  const isInputLocked = phase !== 'answering' || isTimedOut;
  const canSubmit = phase === 'answering' && (isTimedOut || answer.trim() !== '');
  const wordCount = countWords(answer);

  useEffect(() => {
    if (phase !== 'answering') return;
    const timer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const submitAnswer = useCallback(
    async (autoSubmitted: boolean) => {
      const trimmedAnswer = answer.trim();
      const inputMethod = resolveInputMethod(usedVoice, usedTyping);
      const stats = computeDeliveryStats({
        answer: trimmedAnswer,
        timeTakenSeconds: elapsedSeconds,
        timeLimitSeconds,
        usedVoice,
      });

      if (autoSubmitted) setIsTimedOut(true);
      setSubmitError(null);
      setDeliveryStats(stats);
      setPhase('evaluating');

      try {
        const context = getSessionContext();
        const result = await evaluateAnswer({
          question: current,
          answer: trimmedAnswer,
          timeTakenSeconds: elapsedSeconds,
          timeLimitSeconds,
          inputMethod,
          deliveryStats: stats,
          jobTitle: context?.jobTitle ?? '',
          resumeText: context?.resumeText ?? '',
          jobDescription: context?.jobDescription ?? '',
        });
        setFeedback(result);
        setPhase('feedback');
        if (result.status === 'assessable') {
          const practice = recordPractice();
          if (practice.goalJustCompleted) {
            setToastMessage(`Daily goal complete! Streak: ${practice.data.currentStreak} days`);
          }
        }
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'We could not evaluate your answer. Please try again.';
        setSubmitError(message);
        setPhase('answering');
      }
    },
    [answer, current, elapsedSeconds, timeLimitSeconds, usedTyping, usedVoice],
  );

  useEffect(() => {
    if (isTimeUp) void submitAnswer(true);
  }, [isTimeUp, submitAnswer]);

  function handleTranscript(text: string) {
    setAnswer((previous) => appendTranscript(previous, text));
    setUsedVoice(true);
  }

  function handleTypedChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setAnswer(event.target.value);
    setUsedTyping(true);
  }

  function handleRetry() {
    setAnswer('');
    setFeedback(null);
    setDeliveryStats(null);
    setSubmitError(null);
    setElapsedSeconds(0);
    setIsTimedOut(false);
    setUsedVoice(false);
    setUsedTyping(false);
    setPhase('answering');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNext() {
    if (!feedback || !deliveryStats) return;

    const entry: InterviewResult = {
      question: current,
      answer: answer.trim(),
      feedback,
      deliveryStats,
    };
    const nextResults = [...results, entry];
    setResults(nextResults);

    if (isLast) {
      setInterviewResults(nextResults);
      navigate('/results');
      return;
    }
    setIndex((i) => i + 1);
    setAnswer('');
    setFeedback(null);
    setDeliveryStats(null);
    setSubmitError(null);
    setElapsedSeconds(0);
    setIsTimedOut(false);
    setUsedVoice(false);
    setUsedTyping(false);
    setPhase('answering');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-soft">
        <div>
          <p id="practice-mode-label" className="text-sm font-medium text-navy">
            Practice mode (no timer)
          </p>
          <p className="mt-1 text-sm text-slate-600">Take as long as you need. Nothing is submitted automatically.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPracticeMode}
          aria-labelledby="practice-mode-label"
          disabled={phase !== 'answering'}
          onClick={() => setIsPracticeMode((on) => !on)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            isPracticeMode ? 'bg-brand-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
              isPracticeMode ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-sm font-medium text-navy">
          Question {index + 1} of {total}
        </p>
        <ProgressBar value={((index + 1) / total) * 100} label="Interview progress" />
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Badge tone={categoryTone[current.category]}>{current.category}</Badge>
          <Badge tone={difficultyTone[current.difficulty]}>{current.difficulty}</Badge>
        </div>

        <h1 className="mt-6 text-2xl font-semibold leading-snug text-navy sm:text-3xl">{current.text}</h1>

        {!isPracticeMode && (
          <div className="mt-8">
            <QuestionTimer remainingSeconds={remainingSeconds} />
          </div>
        )}

        <div className="mt-8">
          <div className="mb-2 flex items-end justify-between gap-4">
            <label htmlFor="answer" className="text-sm font-medium text-navy">
              Your answer
            </label>
            <VoiceInput disabled={isInputLocked} onTranscript={handleTranscript} />
          </div>
          <textarea
            id="answer"
            rows={8}
            value={answer}
            onChange={handleTypedChange}
            disabled={isInputLocked}
            placeholder="Type your answer as you would say it in the interview..."
            className={textareaClass}
          />
          {isTimedOut && (
            <p role="status" className="mt-2 text-sm font-medium text-amber-700">
              Time is up. Your answer has been locked for review.
            </p>
          )}
          <p className="mt-2 text-right text-sm text-slate-500" aria-live="polite">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            size="lg"
            onClick={() => void submitAnswer(false)}
            disabled={!canSubmit}
            className="w-full sm:w-auto"
          >
            Submit Answer
          </Button>
        </div>

        {submitError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {submitError}
          </p>
        )}
      </Card>

      {phase === 'evaluating' && (
        <Card className="mt-6 flex items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
          <p className="text-base font-medium text-navy">AI is evaluating your answer...</p>
        </Card>
      )}

      {phase === 'feedback' && feedback && deliveryStats && (
        <>
          <div className="mt-6">
            <FeedbackPanel feedback={feedback} onRetry={handleRetry} />
          </div>
          {feedback.status !== 'insufficient' && (
            <div className="mt-6">
              <DeliveryStatsCard stats={deliveryStats} />
            </div>
          )}
          {feedback.status !== 'insufficient' && (
            <div className="mt-6 flex justify-stretch sm:justify-end">
              <Button size="lg" onClick={handleNext} className="w-full sm:w-auto">
                {isLast ? 'View My Report' : 'Next Question'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </>
      )}

      {toastMessage && <Toast key={toastMessage} message={toastMessage} onDismiss={dismissToast} />}
    </div>
  );
}
