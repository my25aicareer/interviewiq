export const DAILY_GOAL = 3;
export const STREAK_CHANGED_EVENT = 'interviewiq:streak-changed';

const STORAGE_KEY = 'interviewiq_streak';
const STORAGE_CHECK_KEY = 'interviewiq_storage_check';
const MAX_PRACTICE_DATES = 60;

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  practiceDates: string[];
  questionsAnsweredToday: number;
  todayDate: string;
}

export interface PracticeResult {
  data: StreakData;
  goalJustCompleted: boolean;
}

function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(dateKey: string, offset: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return toDateKey(new Date(year, month - 1, day + offset));
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function getCurrentWeekDates(now = new Date()) {
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = addDays(toDateKey(now), -mondayOffset);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function emptyData(today: string): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    practiceDates: [],
    questionsAnsweredToday: 0,
    todayDate: today,
  };
}

function isStreakData(value: unknown): value is StreakData {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    typeof data.currentStreak === 'number' &&
    typeof data.longestStreak === 'number' &&
    (data.lastPracticeDate === null || typeof data.lastPracticeDate === 'string') &&
    Array.isArray(data.practiceDates) &&
    data.practiceDates.every((date) => typeof date === 'string') &&
    typeof data.questionsAnsweredToday === 'number' &&
    typeof data.todayDate === 'string'
  );
}

function readStoredData(): StreakData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStreakData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeData(data: StreakData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(STREAK_CHANGED_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function isStorageAvailable() {
  try {
    window.localStorage.setItem(STORAGE_CHECK_KEY, '1');
    window.localStorage.removeItem(STORAGE_CHECK_KEY);
    return true;
  } catch {
    return false;
  }
}

export function resetDailyCountIfNewDay(): StreakData {
  const today = getTodayKey();
  const stored = readStoredData() ?? emptyData(today);
  if (stored.todayDate === today) return stored;

  const next = { ...stored, todayDate: today, questionsAnsweredToday: 0 };
  writeData(next);
  return next;
}

function isStreakAlive(data: StreakData) {
  if (!data.lastPracticeDate) return false;
  const today = getTodayKey();
  return data.lastPracticeDate === today || data.lastPracticeDate === addDays(today, -1);
}

export function getStreakData(): StreakData {
  const data = resetDailyCountIfNewDay();
  return { ...data, currentStreak: isStreakAlive(data) ? data.currentStreak : 0 };
}

export function recordPractice(): PracticeResult {
  const today = getTodayKey();
  const data = resetDailyCountIfNewDay();
  const questionsAnsweredToday = data.questionsAnsweredToday + 1;
  const practiceDates = data.practiceDates.includes(today)
    ? data.practiceDates
    : [...data.practiceDates, today].slice(-MAX_PRACTICE_DATES);
  const goalJustCompleted = questionsAnsweredToday === DAILY_GOAL;

  let next: StreakData = { ...data, questionsAnsweredToday, practiceDates };
  if (goalJustCompleted) {
    const continuesStreak = data.lastPracticeDate === addDays(today, -1);
    const currentStreak = continuesStreak ? data.currentStreak + 1 : 1;
    next = {
      ...next,
      currentStreak,
      longestStreak: Math.max(data.longestStreak, currentStreak),
      lastPracticeDate: today,
    };
  }

  writeData(next);
  return { data: next, goalJustCompleted };
}

export function resetStreak(): boolean {
  return writeData(emptyData(getTodayKey()));
}
