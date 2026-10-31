import { Mic, Square } from 'lucide-react';
import { useEffect } from 'react';
import Button from '@/components/Button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceInputProps {
  disabled: boolean;
  onTranscript: (text: string) => void;
}

export default function VoiceInput({ disabled, onTranscript }: VoiceInputProps) {
  const { isSupported, isListening, error, start, stop } = useSpeechRecognition(onTranscript);

  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);

  if (!isSupported) {
    return <p className="text-sm text-slate-500">Voice input works in Chrome and Edge.</p>;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {isListening ? (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-red-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-600" aria-hidden="true" />
            Listening...
          </span>
          <Button variant="secondary" size="md" onClick={stop}>
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Stop
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="md" disabled={disabled} onClick={start}>
          <Mic className="h-4 w-4" aria-hidden="true" />
          Speak your answer
        </Button>
      )}
      {error && (
        <p role="alert" className="max-w-xs text-right text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
