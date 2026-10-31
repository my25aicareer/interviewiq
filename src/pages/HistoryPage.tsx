
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Session = {
  id: string;
  job_title: string | null;
  created_at: string;
};

type HistoryItem = Session & {
  questionCount: number;
  answeredCount: number;
  averageScore: number | null;
};

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

        let answers: {
          question_id: string;
          relevance_score: number | null;
          clarity_score: number | null;
          structure_score: number | null;
          job_alignment_score: number | null;
        }[] = [];

        if (questionIds.length > 0) {
          const { data: answerData, error: answerError } = await supabase
            .from('interview_answers')
            .select(
              'question_id, relevance_score, clarity_score, structure_score, job_alignment_score',
            )
            .in('question_id', questionIds);

          if (answerError) throw answerError;
          answers = answerData ?? [];
        }

        const items: HistoryItem[] = allSessions.map((session) => {
          const sessionQuestions = questions.filter(
            (q) => q.session_id === session.id,
          );

          const sessionQuestionIds = new Set(
            sessionQuestions.map((q) => q.id),
          );

          const sessionAnswers = answers.filter((a) =>
            sessionQuestionIds.has(a.question_id),
          );

          const scores = sessionAnswers.flatMap((answer) =>
            [
              answer.relevance_score,
              answer.clarity_score,
              answer.structure_score,
              answer.job_alignment_score,
            ].filter((score): score is number => score !== null),
          );

          const averageScore =
            scores.length > 0
              ? scores.reduce((sum, score) => sum + score, 0) / scores.length
              : null;

          return {
            ...session,
            questionCount: sessionQuestions.length,
            answeredCount: sessionAnswers.length,
            averageScore,
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
        Review your previous interview practice sessions.
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
        <div className="space-y-4">
          {sessions.map((session) => {
            const completed =
              session.questionCount > 0 &&
              session.answeredCount === session.questionCount;

            return (
              <div
                key={session.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
              >
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

                <div className="flex flex-col gap-2 sm:items-end">
                  <span
                    className={
                      completed
                        ? 'text-sm font-semibold text-green-700'
                        : 'text-sm font-semibold text-amber-700'
                    }
                  >
                    {completed ? 'Completed' : 'In progress'}
                  </span>

                  {session.averageScore !== null && (
                    <span className="text-sm font-semibold text-gray-700">
                      Average score: {session.averageScore.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
