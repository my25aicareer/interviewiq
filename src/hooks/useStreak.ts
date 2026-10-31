import { useEffect, useState } from 'react';
import { STREAK_CHANGED_EVENT, getStreakData } from '@/services/streak';
import type { StreakData } from '@/services/streak';

export function useStreak(): StreakData {
  const [data, setData] = useState<StreakData>(() => getStreakData());

  useEffect(() => {
    const refresh = () => setData(getStreakData());
    window.addEventListener(STREAK_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(STREAK_CHANGED_EVENT, refresh);
  }, []);

  return data;
}
