import { Award, Check, Lock } from 'lucide-react';
import { useState } from 'react';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { useStreak } from '@/hooks/useStreak';
import {
  DAILY_GOAL,
  getCurrentWeekDates,
  getTodayKey,
  isStorageAvailable,
  resetStreak,
} from '@/services/streak';

const MILESTONES = [
  { days: 3, label: 'Getting Started' },
  { days: 7, label: 'One Week Strong' },
  { days: 14, label: 'Interview Ready' },
];

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StreakCard() {
  const streak = useStreak();
  const [storageAvailable] = useState(isStorageAvailable);
  const [resetError, setResetError] = useState<string | null>(null);
  const todayKey = getTodayKey();
  const weekDates = getCurrentWeekDates();
  const todayCount = Math.min(streak.questionsAnsweredToday, DAILY_GOAL);

  function handleReset() {
    if (!window.confirm('Reset your practice streak? This cannot be undone.')) return;
    setResetError(null);
    if (!resetStreak()) {
      setResetError('We could not reset your streak in this browser.');
    }
  }

  return (
    <Card>
      <div>
        <h2 className="text-xl font-semibold text-navy">Your Practice Streak</h2>
        {streak.currentStreak === 0 && (
          <p className="mt-2 text-sm text-slate-600">Answer 3 questions today to start your streak.</p>
        )}
      </div>

      {!storageAvailable && (
        <p role="alert" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Your browser is blocking local storage, so your streak cannot be saved.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Current streak</p>
          <p className="mt-1 text-3xl font-semibold text-navy">
            {streak.currentStreak}
            <span className="ml-1 text-sm font-medium text-slate-500">days</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Longest streak</p>
          <p className="mt-1 text-3xl font-semibold text-navy">
            {streak.longestStreak}
            <span className="ml-1 text-sm font-medium text-slate-500">days</span>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-navy">Today</span>
          <span className="text-slate-600">{todayCount} of {DAILY_GOAL} questions</span>
        </div>
        <ProgressBar value={(todayCount / DAILY_GOAL) * 100} label="Daily goal progress" />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-navy">This week</p>
        <div className="flex justify-between gap-2">
          {weekDates.map((date, index) => {
            const practised = streak.practiceDates.includes(date);
            const isToday = date === todayKey;
            return (
              <div key={date} className="flex flex-col items-center gap-2">
                <span
                  aria-label={`${WEEKDAY_NAMES[index]}${practised ? ', practised' : ''}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                    practised
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-500'
                  } ${isToday ? 'ring-2 ring-brand-100 ring-offset-2' : ''}`}
                >
                  {practised ? <Check className="h-4 w-4" aria-hidden="true" /> : WEEKDAY_LETTERS[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-navy">Milestones</p>
        <ul className="flex flex-wrap gap-2">
          {MILESTONES.map((milestone) => {
            const unlocked = streak.currentStreak >= milestone.days;
            return (
              <li
                key={milestone.days}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                  unlocked
                    ? 'bg-brand-50 text-brand-700 ring-brand-100'
                    : 'bg-slate-100 text-slate-400 ring-slate-200'
                }`}
              >
                {unlocked ? (
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {milestone.days} days · {milestone.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col items-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-slate-500 underline underline-offset-4 transition-colors hover:text-red-600"
        >
          Reset streak (demo)
        </button>
        {resetError && (
          <p role="alert" className="text-sm text-red-600">
            {resetError}
          </p>
        )}
      </div>
    </Card>
  );
}
