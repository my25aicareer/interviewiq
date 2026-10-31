import { AlertCircle, CheckCircle2, FileText, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import ProgressBar from '@/components/ProgressBar';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const UPLOAD_STEP_MS = 120;
const UPLOAD_STEP_PERCENT = 10;

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file: File) {
  const hasPdfName = file.name.toLowerCase().endsWith('.pdf');
  return hasPdfName && (file.type === '' || file.type === 'application/pdf');
}

export default function FileUpload({ file, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file || progress >= 100) return;
    const timer = window.setTimeout(
      () => setProgress((current) => Math.min(100, current + UPLOAD_STEP_PERCENT)),
      UPLOAD_STEP_MS,
    );
    return () => window.clearTimeout(timer);
  }, [file, progress]);

  function acceptCandidate(candidate: File | undefined) {
    if (!candidate) return;

    if (!isPdf(candidate)) {
      setError(`"${candidate.name}" is not a PDF. Please upload a .pdf file.`);
      return;
    }

    if (candidate.size > MAX_FILE_BYTES) {
      setError(
        `"${candidate.name}" is ${formatFileSize(candidate.size)}. The maximum file size is 5 MB.`,
      );
      return;
    }

    setError(null);
    setProgress(0);
    onChange(candidate);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    acceptCandidate(event.target.files?.[0]);
    event.target.value = '';
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptCandidate(event.dataTransfer.files[0]);
  }

  function handleRemove() {
    setError(null);
    setProgress(0);
    onChange(null);
  }

  const isUploaded = file !== null && progress >= 100;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleInputChange}
      />

      {file === null ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
            isDragging
              ? 'border-brand-600 bg-brand-50'
              : 'border-slate-300 bg-slate-50 hover:border-brand-600 hover:bg-brand-50'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-medium text-navy">
            Drag your resume here or <span className="text-brand-600 underline underline-offset-4">browse</span>
          </span>
          <span className="text-sm text-slate-500">PDF only, up to 5 MB</span>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{file.name}</p>
              <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove resume"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {isUploaded ? (
            <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Resume uploaded successfully
            </p>
          ) : (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm text-slate-600">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} label="Resume upload progress" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
