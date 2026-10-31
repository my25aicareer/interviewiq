import type { AnswerScores, InterviewResult } from '@/types/interview';

const LIST_LIMIT = 5;

export interface RankedItem {
  text: string;
  count: number;
}

export interface DeliverySummary {
  averageWordCount: number;
  averageTimeSeconds: number;
  averageWordsPerMinute: number | null;
  totalFillerCount: number;
}

export interface PerformanceReport {
  assessableCount: number;
  overallScore: number | null;
  dimensionAverages: AnswerScores | null;
  strengths: string[];
  improvements: RankedItem[];
  delivery: DeliverySummary | null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function uniqueInOrder(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rankByFrequency(items: string[]): RankedItem[] {
  const counts = new Map<string, { text: string; count: number }>();
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (!key) continue;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { text: item.trim(), count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, LIST_LIMIT);
}

function summariseDelivery(results: InterviewResult[]): DeliverySummary | null {
  if (results.length === 0) return null;

  const wordsPerMinute = results
    .map((result) => result.deliveryStats.wordsPerMinute)
    .filter((value): value is number => value !== null);
  const averageWpm = average(wordsPerMinute);

  return {
    averageWordCount: roundToTenth(
      average(results.map((result) => result.deliveryStats.wordCount)) ?? 0,
    ),
    averageTimeSeconds: Math.round(
      average(results.map((result) => result.deliveryStats.timeTakenSeconds)) ?? 0,
    ),
    averageWordsPerMinute: averageWpm === null ? null : Math.round(averageWpm),
    totalFillerCount: results.reduce((total, result) => total + result.deliveryStats.fillerCount, 0),
  };
}

export function buildPerformanceReport(results: InterviewResult[]): PerformanceReport {
  const assessable = results.filter((result) => result.feedback.status === 'assessable');
  const answered = results.filter((result) => result.feedback.status !== 'insufficient');

  const dimensionAverages: AnswerScores | null =
    assessable.length === 0
      ? null
      : {
          relevance: roundToTenth(average(assessable.map((r) => r.feedback.scores.relevance)) ?? 0),
          clarity: roundToTenth(average(assessable.map((r) => r.feedback.scores.clarity)) ?? 0),
          structure: roundToTenth(average(assessable.map((r) => r.feedback.scores.structure)) ?? 0),
          jobAlignment: roundToTenth(average(assessable.map((r) => r.feedback.scores.jobAlignment)) ?? 0),
        };

  const overallScore = dimensionAverages
    ? roundToTenth(
        (dimensionAverages.relevance +
          dimensionAverages.clarity +
          dimensionAverages.structure +
          dimensionAverages.jobAlignment) /
          4,
      )
    : null;

  return {
    assessableCount: assessable.length,
    overallScore,
    dimensionAverages,
    strengths: uniqueInOrder(assessable.flatMap((r) => r.feedback.strengths)).slice(0, LIST_LIMIT),
    improvements: rankByFrequency(assessable.flatMap((r) => r.feedback.improvements)),
    delivery: summariseDelivery(answered),
  };
}
