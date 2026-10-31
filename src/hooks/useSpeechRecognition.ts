import { useCallback, useEffect, useRef, useState } from 'react';

interface RecognitionAlternative {
  transcript: string;
}

interface RecognitionResult {
  isFinal: boolean;
  [index: number]: RecognitionAlternative;
}

interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}

interface RecognitionErrorEvent {
  error: string;
}

interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type RecognitionConstructor = new () => RecognitionInstance;

interface SpeechWindow {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

function getRecognitionConstructor(): RecognitionConstructor | null {
  const speechWindow = window as unknown as SpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function describeError(code: string): string | null {
  switch (code) {
    case 'aborted':
      return null;
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Allow microphone access for this site in your browser settings, then try again.';
    case 'no-speech':
      return 'We did not hear anything. Try again and speak clearly.';
    case 'audio-capture':
      return 'No microphone was found. Connect a microphone and try again.';
    default:
      return 'Voice input stopped unexpectedly. Please try again.';
  }
}

export function useSpeechRecognition(onFinalText: (text: string) => void) {
  const [isSupported] = useState(() => getRecognitionConstructor() !== null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<RecognitionInstance | null>(null);
  const onFinalTextRef = useRef(onFinalText);

  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const start = useCallback(() => {
    const RecognitionClass = getRecognitionConstructor();
    if (!RecognitionClass) return;

    const recognition = new RecognitionClass();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let spoken = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) spoken += result[0].transcript;
      }
      const trimmed = spoken.trim();
      if (trimmed) onFinalTextRef.current(trimmed);
    };

    recognition.onerror = (event) => {
      const message = describeError(event.error);
      if (message) setError(message);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { isSupported, isListening, error, start, stop };
}
