import type { Difficulty } from '@/types/interview';

export const TIME_LIMIT_SECONDS: Record<Difficulty, number> = {
  Easy: 90,
  Medium: 120,
  Hard: 180,
};

export function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
