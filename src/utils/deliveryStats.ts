import type { DeliveryStats, FillerCount, InputMethod } from '@/types/interview';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'kind of'];

export function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function findFillers(text: string): FillerCount[] {
  const lowerText = text.toLowerCase();
  return FILLER_WORDS.map((word) => {
    const pattern = new RegExp(`\\b${word.replace(' ', '\\s+')}\\b`, 'g');
    return { word, count: (lowerText.match(pattern) ?? []).length };
  }).filter((filler) => filler.count > 0);
}

export function resolveInputMethod(usedVoice: boolean, usedTyping: boolean): InputMethod {
  if (usedVoice && usedTyping) return 'mixed';
  return usedVoice ? 'voice' : 'typed';
}

interface DeliveryInput {
  answer: string;
  timeTakenSeconds: number;
  timeLimitSeconds: number;
  usedVoice: boolean;
}

export function computeDeliveryStats({
  answer,
  timeTakenSeconds,
  timeLimitSeconds,
  usedVoice,
}: DeliveryInput): DeliveryStats {
  const wordCount = countWords(answer);
  const fillers = findFillers(answer);
  const fillerCount = fillers.reduce((total, filler) => total + filler.count, 0);
  const wordsPerMinute =
    usedVoice && timeTakenSeconds > 0 ? Math.round(wordCount / (timeTakenSeconds / 60)) : null;

  return { timeTakenSeconds, timeLimitSeconds, wordCount, fillerCount, fillers, wordsPerMinute };
}

export function getDeliveryNote(stats: DeliveryStats) {
  if (stats.fillerCount >= 3) return 'Try to reduce filler words';
  if (stats.wordsPerMinute !== null && stats.wordsPerMinute > 170) {
    return 'You are speaking quickly. Slow down slightly.';
  }
  if (stats.wordsPerMinute !== null && stats.wordsPerMinute < 110) {
    return 'Your pace is slow. Try to speak a little more confidently.';
  }
  if (stats.wordCount < 30) return 'Your answer is brief. Add a specific example.';
  return 'Good pace';
}
