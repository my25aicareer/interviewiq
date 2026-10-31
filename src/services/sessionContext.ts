import type { ProfileAnalysis, InterviewQuestion, InterviewResult } from '@/types/interview';

export interface SessionContext {
  sessionId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  resumeText: string;
  analysis: ProfileAnalysis;
  questions: InterviewQuestion[];
}

let context: SessionContext | null = null;
let interviewResults: InterviewResult[] = [];

export function setSessionContext(next: SessionContext) {
  context = next;
}

export function getSessionContext(): SessionContext | null {
  return context;
}

export function clearSessionContext() {
  context = null;
  interviewResults = [];
}

export function setInterviewResults(next: InterviewResult[]) {
  interviewResults = next;
}

export function getInterviewResults(): InterviewResult[] {
  return interviewResults;
}
