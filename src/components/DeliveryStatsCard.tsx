import Card from '@/components/Card';
import type { DeliveryStats } from '@/types/interview';
import { getDeliveryNote } from '@/utils/deliveryStats';
import { formatTime } from '@/utils/interviewTiming';

interface DeliveryStatsCardProps {
  stats: DeliveryStats;
}

export default function DeliveryStatsCard({ stats }: DeliveryStatsCardProps) {
  const tiles = [
    { label: 'Time taken', value: `${formatTime(stats.timeTakenSeconds)} of ${formatTime(stats.timeLimitSeconds)}` },
    { label: 'Word count', value: String(stats.wordCount) },
    ...(stats.wordsPerMinute !== null
      ? [{ label: 'Speaking pace', value: `${stats.wordsPerMinute} wpm` }]
      : []),
    { label: 'Filler words', value: String(stats.fillerCount) },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold text-navy">Communication Style Signals</h2>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-sm text-slate-600">{tile.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-navy">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-sm text-slate-700">
        {stats.fillers.length > 0
          ? `Filler words found: ${stats.fillers.map((filler) => `${filler.word} (${filler.count})`).join(', ')}`
          : 'No filler words found.'}
      </p>

      <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
        {getDeliveryNote(stats)}
      </p>

      <p className="mt-4 text-xs text-slate-500">
        These are practice signals, not a personality assessment.
      </p>
    </Card>
  );
}
