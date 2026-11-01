import { CheckCircle2, Lightbulb, MessageSquare, RotateCcw, AlertTriangle, X, Check } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ScoreChip from '@/components/ScoreChip';
import type { AnswerFeedback, StarCheck } from '@/types/interview';

const starItems: { key: keyof StarCheck; label: string }[] = [
  { key: 'situation', label: 'Situation' },
  { key: 'task', label: 'Task' },
  { key: 'action', label: 'Action' },
  { key: 'result', label: 'Result' },
];

function StarChecklist({ star }: { star: StarCheck }) {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-semibold text-navy">STAR checklist</h3>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {starItems.map((item) => {
          const passed = star[item.key];
          return (
            <li
              key={item.key}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-navy"
            >
              {passed ? (
                <Check className="h-4 w-4 text-emerald-700" aria-label="Included" />
              ) : (
                <X className="h-4 w-4 text-red-600" aria-label="Missing" />
              )}
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InsufficientView({ onRetry }: { onRetry: () => void }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-600" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-navy">N/A (Not assessable)</h2>
        <p className="max-w-md text-sm leading-normal text-slate-600">
          Your response couldn't be evaluated because it didn't contain meaningful content. Try Again.
        </p>
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </Button>
      </div>
    </Card>
  );
}

function LimitedView({ feedback, onRetry }: { feedback: AnswerFeedback; onRetry: () => void }) {
  const { scores } = feedback;
  return (
    <Card>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold text-amber-900">Limited evidence</h2>
          <p className="mt-1 text-sm leading-normal text-amber-800">
            Your answer was brief, so these scores are tentative. Expand on your response for a more
            reliable assessment.
          </p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-navy">Tentative scores</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ScoreChip label="Relevance" score={scores.relevance} />
        <ScoreChip label="Clarity" score={scores.clarity} />
        <ScoreChip label="Structure" score={scores.structure} />
        <ScoreChip label="Job Alignment" score={scores.jobAlignment} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-navy">Strengths</h3>
          <ul className="mt-3 space-y-3">
            {feedback.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy">Areas for Improvement</h3>
          <ul className="mt-3 space-y-3">
            {feedback.improvements.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50 p-5">
        <h3 className="text-sm font-semibold text-brand-700">Suggested Improved Answer</h3>
        <p className="mt-2 text-sm leading-normal text-navy">{feedback.improvedAnswer}</p>
      </div>

      {feedback.followUp && (
        <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-navy">Possible follow-up question</h3>
            <p className="mt-1 text-sm leading-normal text-slate-700">{feedback.followUp}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Rewrite answer
        </Button>
      </div>
    </Card>
  );
}

function AssessableView({ feedback }: { feedback: AnswerFeedback }) {
  const { scores } = feedback;
  return (
    <Card>
      <h2 className="text-xl font-semibold text-navy">Your feedback</h2>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ScoreChip label="Relevance" score={scores.relevance} />
        <ScoreChip label="Clarity" score={scores.clarity} />
        <ScoreChip label="Structure" score={scores.structure} />
        <ScoreChip label="Job Alignment" score={scores.jobAlignment} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-navy">Strengths</h3>
          <ul className="mt-3 space-y-3">
            {feedback.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy">Areas for Improvement</h3>
          <ul className="mt-3 space-y-3">
            {feedback.improvements.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-normal text-slate-700">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {feedback.star && <StarChecklist star={feedback.star} />}

      <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50 p-5">
        <h3 className="text-sm font-semibold text-brand-700">Suggested Improved Answer</h3>
        <p className="mt-2 text-sm leading-normal text-navy">{feedback.improvedAnswer}</p>
      </div>

      {feedback.followUp && (
        <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-semibold text-navy">Possible follow-up question</h3>
            <p className="mt-1 text-sm leading-normal text-slate-700">{feedback.followUp}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

interface FeedbackPanelProps {
  feedback: AnswerFeedback;
  onRetry?: () => void;
}

export default function FeedbackPanel({ feedback, onRetry }: FeedbackPanelProps) {
  if (feedback.status === 'insufficient') {
    return <InsufficientView onRetry={onRetry ?? (() => {})} />;
  }

  if (feedback.status === 'limited') {
    return <LimitedView feedback={feedback} onRetry={onRetry ?? (() => {})} />;
  }

  return <AssessableView feedback={feedback} />;
}
