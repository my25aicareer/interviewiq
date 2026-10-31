export type QuestionCategory =
  | 'Resume-based'
  | 'Technical'
  | 'Behavioural'
  | 'Situational'
  | 'Career Motivation';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestion {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  text: string;
  evaluationCriteria: string[];
}

export interface AnswerScores {
  relevance: number;
  clarity: number;
  structure: number;
  jobAlignment: number;
}

export interface StarCheck {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
}

export type AnswerStatus = 'assessable' | 'limited' | 'insufficient';

export interface AnswerFeedback {
  status: AnswerStatus;
  scores: AnswerScores;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
  followUp: string | null;
  overallScore?: number;
  star?: StarCheck;
}

export interface ProfileAnalysis {
  matchScore: number;
  skills: string[];
}

export type InputMethod = 'typed' | 'voice' | 'mixed';

export interface FillerCount {
  word: string;
  count: number;
}

export interface DeliveryStats {
  timeTakenSeconds: number;
  timeLimitSeconds: number;
  wordCount: number;
  fillerCount: number;
  fillers: FillerCount[];
  wordsPerMinute: number | null;
}

export interface InterviewResult {
  question: InterviewQuestion;
  answer: string;
  feedback: AnswerFeedback;
  deliveryStats: DeliveryStats;
}

export interface EvaluateAnswerInput {
  question: InterviewQuestion;
  answer: string;
  timeTakenSeconds: number;
  timeLimitSeconds: number;
  inputMethod: InputMethod;
  deliveryStats: DeliveryStats;
  jobTitle: string;
  resumeText: string;
  jobDescription: string;
}
