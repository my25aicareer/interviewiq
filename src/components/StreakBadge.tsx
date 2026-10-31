import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

export default function StreakBadge() {
  const { currentStreak } = useStreak();
  const isActive = currentStreak > 0;

  return (
    <span
      aria-label={`Practice streak: ${currentStreak} days`}
      title="Practice streak"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${
        isActive ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-slate-100 text-slate-500 ring-slate-200'
      }`}
    >
      <Flame
        className={`h-4 w-4 ${isActive ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`}
        aria-hidden="true"
      />
      {currentStreak}
    </span>
  );
}
