import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
