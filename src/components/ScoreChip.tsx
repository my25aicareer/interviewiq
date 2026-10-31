interface ScoreChipProps {
  label: string;
  score: number;
  max?: number;
}

function toneFor(score: number) {
  if (score >= 4) return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (score >= 3) return 'border-brand-100 bg-brand-50 text-brand-700';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

export default function ScoreChip({ label, score, max = 5 }: ScoreChipProps) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border p-4 ${toneFor(score)}`}>
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-2xl font-semibold">
        {score}
        <span className="text-sm font-medium text-slate-500">/{max}</span>
      </span>
    </div>
  );
}
