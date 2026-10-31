import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold text-navy">InterviewIQ</span>
    </Link>
  );
}
