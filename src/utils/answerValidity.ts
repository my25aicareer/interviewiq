const MIN_WORDS = 3;
const MAX_WORD_LENGTH = 25;
const KEYBOARD_RUN = /asdf|sdfg|dfgh|fghj|ghjk|qwer|wert|erty|tyui|uiop|zxcv|xcvb|cvbn|vbnm/i;
const REPEATED_CHARACTER = /(.)\1{3,}/;
const LATIN_WORD = /^[a-z]+$/i;
const VOWEL = /[aeiouy]/i;

function isPlausibleWord(word: string): boolean {
  if (word.length > MAX_WORD_LENGTH) return false;
  if (REPEATED_CHARACTER.test(word)) return false;
  if (KEYBOARD_RUN.test(word)) return false;
  if (LATIN_WORD.test(word) && word.length >= 4 && !VOWEL.test(word)) return false;
  return true;
}

export function hasMeaningfulContent(text: string): boolean {
  const words = text.match(/\p{L}+/gu) ?? [];
  if (words.length < MIN_WORDS) return false;

  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  if (uniqueWords.size < 2) return false;

  const plausibleCount = words.filter(isPlausibleWord).length;
  return plausibleCount / words.length >= 0.6;
}

export function isUnevaluableAnswer(text: string, relevanceScore: number | null): boolean {
  if (!hasMeaningfulContent(text)) return true;
  return relevanceScore !== null && relevanceScore <= 1;
}

interface SavedAnswerRecord {
  question_id: string;
  created_at: string;
  answer_text: string;
  relevance_score: number | null;
}

export function selectLatestUsableAnswers<T extends SavedAnswerRecord>(rows: T[]): T[] {
  const latestByQuestion = new Map<string, T>();

  for (const row of rows) {
    if (isUnevaluableAnswer(row.answer_text, row.relevance_score)) continue;

    const current = latestByQuestion.get(row.question_id);
    if (!current || Date.parse(row.created_at) > Date.parse(current.created_at)) {
      latestByQuestion.set(row.question_id, row);
    }
  }

  return [...latestByQuestion.values()];
}
