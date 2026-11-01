
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb, Minus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Badge from '@/components/Badge';
import type { BadgeTone } from '@/components/Badge';
import Card from '@/components/Card';
import ScoreChip from '@/components/ScoreChip';
import { buttonStyles } from '@/components/buttonStyles';
import { getInterviewResults } from '@/services/sessionContext';
import type { AnswerStatus, InterviewResult } from '@/types/interview';
import { buildPerformanceReport } from '@/utils/performanceReport';
import type { DeliverySummary, PerformanceReport } from '@/utils/performanceReport';
import { formatTime } from '@/utils/interviewTiming';

type SavedQuestion = {
  id: string;
  session_id: string;
  question_text: string;
  category: string;
  difficulty: string;
  evaluation_criteria: unknown;
  sequence_number: number;
};

type SavedAnswer = {
  question_id: string;
  created_at: string;
  answer_text: string;
  relevance_score: number | null;
  clarity_score: number | null;
  structure_score: number | null;
  job_alignment_score: number | null;
  strengths: unknown;
  improvements: unknown;
  improved_answer: string | null;
};

function toTextArray(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string') return item.trim() ? [item.trim()] : [];
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const text = obj.description ?? obj.text ?? obj.title ?? obj.strength ?? obj.improvement;
        return typeof text === 'string' && text.trim() ? [text.trim()] : [];
      }
      return [];
    });
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const text = obj.description ?? obj.text ?? obj.title ?? obj.strength ?? obj.improvement;
    return typeof text === 'string' && text.trim() ? [text.trim()] : [];
  }

  return [];
}

function makeHistoricalResults(
  questions: SavedQuestion[],
  answers: SavedAnswer[],
): InterviewResult[] {
  const answerMap = new Map(answers.map((answer) => [answer.question_id, answer]));

  return questions.map((question) => {
    const answer = answerMap.get(question.id);

    const scores = {
      relevance: answer?.relevance_score ?? 0,
      clarity: answer?.clarity_score ?? 0,
      structure: answer?.structure_score ?? 0,
      jobAlignment: answer?.job_alignment_score ?? 0,
    };

    const hasAnyScore = [
      answer?.relevance_score,
      answer?.clarity_score,
      answer?.structure_score,
      answer?.job_alignment_score,
    ].some((score) => score !== null && score !== undefined);

    const hasAllScores = [
      answer?.relevance_score,
      answer?.clarity_score,
      answer?.structure_score,
      answer?.job_alignment_score,
    ].every((score) => score !== null && score !== undefined);

    const status: AnswerStatus = !answer
      ? 'insufficient'
      : hasAllScores
        ? 'assessable'
        : hasAnyScore
          ? 'limited'
          : 'insufficient';

    return {
      question: {
        id: question.id,
        category: question.category,
        difficulty: question.difficulty,
        text: question.question_text,
        evaluationCriteria: Array.isArray(question.evaluation_criteria)
          ? question.evaluation_criteria
          : [],
      },
      answer: answer?.answer_text ?? '',
      feedback: {
        status,
        scores,
        strengths: toTextArray(answer?.strengths),
        improvements: toTextArray(answer?.improvements),
        improvedAnswer: answer?.improved_answer ?? '',
        followUp: null,
      },
      deliveryStats: {
        timeTakenSeconds: 0,
        timeLimitSeconds: 0,
        wordCount: answer?.answer_text?.trim()
          ? answer.answer_text.trim().split(/\s+/).length
          : 0,
        fillerCount: 0,
        fillers: [],
        wordsPerMinute: null,
      },
    } as InterviewResult;
  });
}

const statusLabel: Record<AnswerStatus, string> = {
  assessable: 'Assessable',
  limited: 'Limited evidence',
  insufficient: 'N/A (Not assessable)',
};

const statusTone: Record<AnswerStatus, BadgeTone> = {
  assessable: 'emerald',
  limited: 'amber',
  insufficient: 'slate',
};

const scoreLabels = [
  { key: 'relevance', label: 'Relevance' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'structure', label: 'Structure' },
  { key: 'jobAlignment', label: 'Job Alignment' },
] as const;

function OverallSummary({ report, total }: { report: PerformanceReport; total: number }) {
  return (
    <Card>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">Overall interview score</p>
          <p className="mt-2 text-5xl font-semibold text-navy">
            {report.overallScore === null ? 'N/A' : report.overallScore.toFixed(1)}
            {report.overallScore !== null && <span className="text-xl font-medium text-slate-500"> / 5</span>}
          </p>
        </div>
      </div>

      {report.dimensionAverages ? (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {scoreLabels.map((item) => (
            <ScoreChip key={item.key} label={item.label} score={report.dimensionAverages![item.key]} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-slate-600">
          None of your {total} answers could be assessed, so no scores are available.
        </p>
      )}
      {report.dimensionAverages && (
        <p className="mt-4 text-xs text-slate-500">
          Averages across the {report.assessableCount} assessable{' '}
          {report.assessableCount === 1 ? 'answer' : 'answers'}. Limited and not assessable answers are excluded.
        </p>
      )}
    </Card>
  );
}

function StrengthsAndImprovements({ report }: { report: PerformanceReport }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold text-navy">Overall strengths</h2>
        {report.strengths.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {report.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No strengths to show yet.</p>
        )}
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-navy">Common improvement areas</h2>
        {report.improvements.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {report.improvements.map((item) => (
              <li key={item.text} className="flex gap-3 text-sm leading-normal text-slate-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                <span>
                  {item.text}
                  {item.count > 1 && <span className="ml-2 text-xs text-slate-500">(noted {item.count} times)</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No improvement areas to show yet.</p>
        )}
      </Card>
    </div>
  );
}

function DeliveryCard({ delivery }: { delivery: DeliverySummary }) {
  const tiles = [
    { label: 'Average words per answer', value: String(delivery.averageWordCount) },
    { label: 'Average time per answer', value: formatTime(delivery.averageTimeSeconds) },
    ...(delivery.averageWordsPerMinute !== null
      ? [{ label: 'Average speaking pace', value: `${delivery.averageWordsPerMinute} wpm` }]
      : []),
    { label: 'Filler words in total', value: String(delivery.totalFillerCount) },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-navy">Communication Style Signals</h2>
      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-sm text-slate-600">{tile.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-navy">{tile.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-slate-500">These are practice signals, not a personality assessment.</p>
    </Card>
  );
}

function QuestionFeedbackCard({ result, number }: { result: InterviewResult; number: number }) {
  const { feedback, question } = result;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Question {number}</span>
        <Badge tone={statusTone[feedback.status]}>{statusLabel[feedback.status]}</Badge>
        <Badge tone="blue">{question.category}</Badge>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-navy">{question.text}</h3>

      {feedback.status === 'limited' && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm leading-normal text-amber-800">
            Limited evidence: this answer was brief, so these scores are tentative and are not included in your overall score.
          </p>
        </div>
      )}

      {feedback.status === 'insufficient' ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Minus className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <p className="text-sm leading-normal text-slate-700">
            This answer could not be evaluated because it did not contain meaningful content. It is not included in your scores.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {scoreLabels.map((item) => (
              <ScoreChip key={item.key} label={item.label} score={feedback.scores[item.key]} />
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-navy">Strengths</h4>
              <ul className="mt-3 space-y-2">
                {feedback.strengths.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-navy">Areas for improvement</h4>
              <ul className="mt-3 space-y-2">
                {feedback.improvements.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h4 className="text-sm font-semibold text-navy">Your answer</h4>
        <p className="mt-2 whitespace-pre-line text-sm leading-normal text-slate-700">
          {result.answer || 'No answer was saved for this question.'}
        </p>
      </div>

      {feedback.improvedAnswer && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h4 className="text-sm font-semibold text-navy">Suggested improved answer</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-normal text-slate-700">
            {feedback.improvedAnswer}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const currentResults = getInterviewResults();

  const [historicalResults, setHistoricalResults] = useState<InterviewResult[]>([]);
  const [historicalTitle, setHistoricalTitle] = useState('');
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadHistoricalReport() {
      setLoading(true);
      setError('');

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('Please sign in to view this report.');

        const { data: session, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('id, job_title')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (sessionError) throw sessionError;
        if (!session) throw new Error('This interview could not be found.');

        const { data: questions, error: questionError } = await supabase
          .from('interview_questions')
          .select('id, session_id, question_text, category, difficulty, evaluation_criteria, sequence_number')
          .eq('session_id', sessionId)
          .order('sequence_number', { ascending: true });

        if (questionError) throw questionError;

        const questionIds = (questions ?? []).map((question) => question.id);
        let answers: SavedAnswer[] = [];

        if (questionIds.length > 0) {
          const { data: answerData, error: answerError } = await supabase
            .from('interview_answers')
            .select('question_id, created_at, answer_text, relevance_score, clarity_score, structure_score, job_alignment_score, strengths, improvements, improved_answer')
            .in('question_id', questionIds);

          if (answerError) throw answerError;

          const latestByQuestion = new Map<string, SavedAnswer>();
          for (const answer of (answerData ?? []) as SavedAnswer[]) {
            const current = latestByQuestion.get(answer.question_id);
            if (
              !current ||
              Date.parse(answer.created_at) > Date.parse(current.created_at)
            ) {
              latestByQuestion.set(answer.question_id, answer);
            }
          }
          answers = [...latestByQuestion.values()];
        }

        if (!cancelled) {
          setHistoricalTitle(session.job_title || 'Interview session');
          setHistoricalResults(
            makeHistoricalResults((questions ?? []) as SavedQuestion[], answers),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load this report.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistoricalReport();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (sessionId && loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-slate-600">Loading your saved interview report...</p>
      </div>
    );
  }

  if (sessionId && error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Card>
          <p className="text-red-700">{error}</p>
          <Link to="/history" className={`${buttonStyles({ variant: 'secondary' })} mt-5`}>
            Back to interview history
          </Link>
        </Card>
      </div>
    );
  }

  const results = sessionId ? historicalResults : currentResults;

  if (results.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">Your Performance Report</h1>
        <Card className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
          <p className="max-w-md text-base text-slate-600">
            {sessionId
              ? 'There are no saved questions for this interview yet.'
              : 'There is no report yet. Complete a practice interview to see your performance here.'}
          </p>
          <Link to={sessionId ? '/history' : '/prepare'} className={buttonStyles({ size: 'lg' })}>
            {sessionId ? 'Back to interview history' : 'Start a practice interview'}
          </Link>
        </Card>
      </div>
    );
  }

  const report = buildPerformanceReport(results);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header>
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">Your Performance Report</h1>
        <p className="mt-3 text-base text-slate-600">
          {sessionId
            ? `Saved report for ${historicalTitle}.`
            : 'A summary of your practice interview, based on your answers and the feedback you received.'}
        </p>
      </header>

      <OverallSummary report={report} total={results.length} />
      <StrengthsAndImprovements report={report} />

      {!sessionId && report.delivery && (
        <DeliveryCard delivery={report.delivery} />
      )}

      {sessionId && (
        <p className="text-xs text-slate-500">
          This historical report uses the information saved during your interview. Speaking-time and filler-word statistics were not saved for this session.
        </p>
      )}

      <section aria-labelledby="question-feedback-heading" className="space-y-6 pt-4">
        <h2 id="question-feedback-heading" className="text-xl font-semibold text-navy">
          Question-by-question feedback
        </h2>
        {results.map((result, index) => (
          <QuestionFeedbackCard key={result.question.id} result={result} number={index + 1} />
        ))}
      </section>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        {sessionId && (
          <Link to="/history" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
            Back to interview history
          </Link>
        )}
        <Link to="/prepare" className={buttonStyles({ size: 'lg' })}>
          Start a new practice interview
        </Link>
      </div>
    </div>
  );
}
