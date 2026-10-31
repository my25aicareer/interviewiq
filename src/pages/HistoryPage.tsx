
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type InterviewSession = {
  id: string;
  job_title: string | null;
  overall_score: number | null;
  created_at: string;
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const { data: { user }, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('Please sign in to view your history.');

        const { data, error: queryError } = await supabase
          .from('interview_sessions')
          .select('id, job_title, overall_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;

        setSessions(data ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not load interview history.',
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

      {loading && (
        <p className="text-gray-500">Loading your interviews...</p>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-xl border border-gray-200 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">
            No interviews yet
          </h2>
          <p className="text-gray-500">
            Your completed interview sessions will appear here.
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => (
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
              </div>

              <div className="text-sm">
                {session.overall_score !== null ? (
                  <span className="font-semibold text-green-700">
                    Score: {session.overall_score}
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Score not available
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
