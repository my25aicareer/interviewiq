
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Session = {
  id: string;
  job_title: string | null;
  created_at: string;
};

type Answer = {
  question_id: string;
  relevance_score: number | null;
  clarity_score: number | null;
  structure_score: number | null;
  job_alignment_score: number | null;
  strengths: unknown;
  improvements: unknown;
};

type HistoryItem = Session & {
  questionCount: number;
  answeredCount: number;
  averageScore: number | null;
  strongestArea: string | null;
  improvementArea: string | null;
  strengthSummary: string | null;
  improvementSummary: string | null;
};

function getFirstText(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const result = getFirstText(item);
      if (result) return result;
    }
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    for (const key of ['description', 'text', 'title', 'strength', 'improvement']) {
      const result = getFirstText(obj[key]);
      if (result) return result;
    }
  }

  return null;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const { data: { user }, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('Please sign in to view your history.');

        const { data: sessionData, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('id, job_title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (sessionError) throw sessionError;

        const allSessions = (sessionData ?? []) as Session[];

        if (allSessions.length === 0) {
          setSessions([]);
          return;
        }

        const sessionIds = allSessions.map((s) => s.id);

        const { data: questionData, error: questionError } = await supabase
          .from('interview_questions')
          .select('id, session_id')
          .in('session_id', sessionIds);

        if (questionError) throw questionError;

        const questions = questionData ?? [];
        const questionIds = questions.map((q) => q.id);

        let answers: Answer[] = [];

        if (questionIds.length > 0) {
          const { data: answerData, error: answerError } = await supabase
            .from('interview_answers')
            .select(
              'question_id, relevance_score, clarity_score, structure_score, job_alignment_score, strengths, improvements',
            )
            .in('question_id', questionIds);

          if (answerError) throw answerError;
          answers = (answerData ?? []) as Answer[];
        }

        const items: HistoryItem[] = allSessions.map((session) => {
          const sessionQuestions = questions.filter(
            (q) => q.session_id === session.id,
          );

          const questionIdSet = new Set(
            sessionQuestions.map((q) => q.id),
          );

          const sessionAnswers = answers.filter((a) =>
            questionIdSet.has(a.question_id),
          );

          const scoreFields = [
            { label: 'Relevance', key: 'relevance_score' },
            { label: 'Clarity', key: 'clarity_score' },
            { label: 'Structure', key: 'structure_score' },
            { label: 'Job alignment', key: 'job_alignment_score' },
          ] as const;

          const scores = sessionAnswers.flatMap((answer) =>
            scoreFields
              .map((field) => answer[field.key])
              .filter((score): score is number => score !== null),
          );

          const averageScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : null;

          const areaAverages = scoreFields.map((field) => {
            const values = sessionAnswers
              .map((answer) => answer[field.key])
              .filter((score): score is number => score !== null);

            return {
              label: field.label,
              average: values.length
                ? values.reduce((sum, score) => sum + score, 0) / values.length
                : null,
            };
          }).filter((area) => area.average !== null);

          areaAverages.sort((a, b) => b.average! - a.average!);

          const strengthSummary =
            sessionAnswers
              .map((answer) => getFirstText(answer.strengths))
              .find(Boolean) ?? null;

          const improvementSummary =
            sessionAnswers
              .map((answer) => getFirstText(answer.improvements))
              .find(Boolean) ?? null;

          return {
            ...session,
            questionCount: sessionQuestions.length,
            answeredCount: sessionAnswers.length,
            averageScore,
            strongestArea: areaAverages[0]?.label ?? null,
            improvementArea:
              areaAverages.length > 1
                ? areaAverages[areaAverages.length - 1].label
                : null,
            strengthSummary,
            improvementSummary,
          };
        });

        setSessions(items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load interview history.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold">Interview History</h1>
      <p className="mb-8 text-gray-500">
        Track your progress across previous interview sessions.
      </p>

      {loading && <p className="text-gray-500">Loading your interviews...</p>}

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">No interviews yet</h2>
          <p className="text-gray-500">
            Your interview sessions will appear here.
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="space-y-5">
          {sessions.map((session) => {
            const completed =
              session.questionCount > 0 &&
              session.answeredCount === session.questionCount;

            return (
              <div
                key={session.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {session.job_title || 'Interview session'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {session.answeredCount} of {session.questionCount} questions answered
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
                      completed
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {completed ? 'Completed' : 'In progress'}
                  </span>
                </div>

                {completed && (
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Average score</p>
                        <p className="mt-1 text-2xl font-bold">
                          {session.averageScore !== null
                            ? `${session.averageScore.toFixed(1)}/5`
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Questions completed</p>
                        <p className="mt-1 text-2xl font-bold">
                          {session.answeredCount}/{session.questionCount}
                        </p>
                      </div>
                    </div>

                    {(session.strongestArea || session.improvementArea) && (
                      <div className="mt-4 space-y-2 text-sm">
                        {session.strongestArea && (
                          <p>
                            <span className="font-semibold text-green-700">
                              Strongest area:
                            </span>{' '}
                            {session.strongestArea}
                          </p>
                        )}
                        {session.improvementArea && (
                          <p>
                            <span className="font-semibold text-amber-700">
                              Focus area:
                            </span>{' '}
                            {session.improvementArea}
                          </p>
                        )}
                      </div>
                    )}

                    {session.strengthSummary && (
                      <p className="mt-4 text-sm text-gray-600">
                        <span className="font-semibold">Strength:</span>{' '}
                        {session.strengthSummary}
                      </p>
                    )}

                    {session.improvementSummary && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">To improve:</span>{' '}
                        {session.improvementSummary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
