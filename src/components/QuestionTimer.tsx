import { Clock } from 'lucide-react';
import { formatTime } from '@/utils/interviewTiming';

interface QuestionTimerProps {
  remainingSeconds: number;
}

export default function QuestionTimer({ remainingSeconds }: QuestionTimerProps) {
  const toneClass =
    remainingSeconds < 10 ? 'text-red-600' : remainingSeconds < 30 ? 'text-amber-700' : 'text-brand-600';

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Clock className="h-4 w-4" aria-hidden="true" />
        Time remaining
      </span>
      <span className={`text-3xl font-semibold tabular-nums ${toneClass}`} role="timer">
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}
