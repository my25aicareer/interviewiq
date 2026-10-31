# Project memory

## Product intent & audience

AI-powered interview practice platform. Candidates complete mock interviews, receive AI feedback per answer, and get a final performance report. Audience: job seekers improving interview delivery and content quality.

## Brand personality & voice

Professional, encouraging, results-oriented. Feedback is specific and actionable. UI communicates quality and polish expected of production software.

## Visual design & UX direction

- Stack: Vite + React + TypeScript, Tailwind CSS, Lucide React icons
- Path alias `@/` → `src/` for all project imports
- Existing interview flow and UI styling must be preserved across changes
- Results page renders an aggregate report: overall score (/5), dimension scores (relevance, clarity, structure, job alignment), per-question feedback with candidate answers, strengths, improvement areas, delivery stats
- Answer statuses: fully assessable, limited (show warning, visually distinguished), insufficient (excluded from aggregates, shown as N/A)
- Delivery stats: words, time, pace (voice only), filler words

## Decisions, constraints & rationale

- Performance Report feature implemented; results route replaces ComingSoonPage (ComingSoonPage retained for history route)
- `InterviewResult` type added in `src/types/interview.ts`
- `sessionContext.ts` stores completed results in memory (not persisted)
- `InterviewSession.tsx` accumulates final submitted answer + AI feedback + delivery stats per question; retries replace prior entry (no duplicates); saves to sessionContext before navigating to `/results`
- Aggregation logic isolated in `src/utils/performanceReport.ts` (pure utility)
- Aggregate scores use assessable answers only; insufficient excluded; limited included with warning
- No new AI feedback generated — reuses existing feedback
- Supabase DB and Edge Function untouched
- Build passes; TypeScript check passes; not browser-tested

## Open questions & assumptions

- Should candidates be able to skip a question as N/A? (Insufficient answers currently can't reach the report)
- Results live in memory only — refresh empties the report page; persistence not implemented
- Common improvement areas match identical wording only; repeat detection may be weak
- Report page behavior with empty results (e.g. direct navigation) not validated