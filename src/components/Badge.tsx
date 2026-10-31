import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'slate' | 'emerald' | 'amber' | 'red';

const toneClasses: Record<BadgeTone, string> = {
  blue: 'bg-brand-50 text-brand-700 ring-brand-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone = 'slate', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
