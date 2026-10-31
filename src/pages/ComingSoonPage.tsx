import { Clock } from 'lucide-react';
import Card from '@/components/Card';

interface ComingSoonPageProps {
  title: string;
}

export default function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-3xl font-semibold text-navy sm:text-4xl">{title}</h1>
      <Card className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="text-xl font-semibold text-navy">Coming soon</h2>
        <p className="max-w-md text-base text-slate-600">This page is on its way and will be available in an upcoming update.</p>
      </Card>
    </div>
  );
}
