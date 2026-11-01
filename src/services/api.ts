import { supabase } from '@/lib/supabase';
import { hasMeaningfulContent, isUnevaluableAnswer } from '@/utils/answerValidity';
import type {
  AnswerFeedback,
  AnswerScores,
  AnswerStatus,
  Difficulty,
  EvaluateAnswerInput,
  InterviewQuestion,
  ProfileAnalysis,
  QuestionCategory,
} from '@/types/interview';

const FUNCTION_NAME = 'interview-ai';

export class EdgeFunctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

interface AnalyseResponse {
  session_id: string;
  result: {
    indicative_match_score: number;
    skills: string[];
  } | null;
}

interface QuestionDto {
  id: string;
  question_text: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  evaluation_criteria: string[];
}

interface GenerateQuestionsResponse {
  questions: QuestionDto[];
}

interface EvaluateResponse {
  answer_id: string;
  overall_score: number;
  result: {
    relevance_score: number;
    clarity_score: number;
    structure_score: number;
    job_alignment_score: number;
    strengths: string[];
    improvements: string[];
    improved_answer: string;
    follow_up_question: string | null;
  } | null;
}

async function invokeFunction(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });

  if (error) {
    throw new EdgeFunctionError(error.message || 'The interview service could not respond. Please try again.');
  }

  return data;
}

export async function analyseProfile(input: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}): Promise<ProfileAnalysis & { sessionId: string }> {
  const data = await invokeFunction({
    operation: 'analyse',
    job_title: input.jobTitle,
    resume_text: input.resumeText,
    job_description: input.jobDescription,
  }) as AnalyseResponse;

  const result = data.result;
  if (!result) {
    throw new EdgeFunctionError('The interview service returned an empty analysis. Please try again.');
  }

  return {
    sessionId: data.session_id,
    matchScore: result.indicative_match_score,
    skills: result.skills ?? [],
  };
}

const pendingQuestionRequests = new Map<string, Promise<InterviewQuestion[]>>();

export async function generateQuestions(input: {
  sessionId: string;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
}): Promise<InterviewQuestion[]> {
  const existingRequest = pendingQuestionRequests.get(input.sessionId);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    const data = await invokeFunction({
      operation: 'generate_questions',
      session_id: input.sessionId,
      job_title: input.jobTitle,
      resume_text: input.resumeText,
      job_description: input.jobDescription,
    }) as GenerateQuestionsResponse;

    const questions = data.questions ?? [];

    return questions.map((question) => ({
      id: question.id,
      text: question.question_text,
      category: question.category,
      difficulty: question.difficulty,
      evaluationCriteria: question.evaluation_criteria,
    }));
  })();

  pendingQuestionRequests.set(input.sessionId, request);

  try {
    return await request;
  } finally {
    pendingQuestionRequests.delete(input.sessionId);
  }
}
const SHORT_ANSWER_WORD_COUNT = 8;

function classifyStatus(
  answerText: string,
  scores: AnswerScores,
): AnswerStatus {
  if (isUnevaluableAnswer(answerText, scores.relevance)) return 'insufficient';

  const wordCount = answerText.trim().split(/\s+/).length;
  const isShort = wordCount < SHORT_ANSWER_WORD_COUNT;

  if (isShort && scores.relevance <= 2) return 'limited';
  return 'assessable';
}

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<AnswerFeedback> {
  if (!hasMeaningfulContent(input.answer)) {
    return {
      status: 'insufficient',
      scores: { relevance: 0, clarity: 0, structure: 0, jobAlignment: 0 },
      strengths: [],
      improvements: [],
      improvedAnswer: '',
      followUp: null,
    };
  }

  const data = await invokeFunction({
    operation: 'evaluate',
    job_title: input.jobTitle,
    resume_text: input.resumeText,
    job_description: input.jobDescription,
    question_id: input.question.id,
    question_text: input.question.text,
    category: input.question.category,
    evaluation_criteria: input.question.evaluationCriteria,
    candidate_answer: input.answer,
  }) as EvaluateResponse;

  const result = data.result;
  if (!result) {
    throw new EdgeFunctionError('The interview service returned an empty evaluation. Please try again.');
  }

  const scores: AnswerScores = {
    relevance: result.relevance_score,
    clarity: result.clarity_score,
    structure: result.structure_score,
    jobAlignment: result.job_alignment_score,
  };

  return {
    status: classifyStatus(input.answer, scores),
    scores,
    strengths: result.strengths ?? [],
    improvements: result.improvements ?? [],
    improvedAnswer: result.improved_answer,
    followUp: result.follow_up_question ?? null,
    overallScore: data.overall_score,
  };
}
