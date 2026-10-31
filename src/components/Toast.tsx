import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

const TOAST_DURATION_MS = 4000;

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl bg-navy px-5 py-3 text-sm font-medium text-white shadow-lift"
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
      {message}
    </div>
  );
}
