import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FileUpload from '@/components/FileUpload';
import StreakCard from '@/components/StreakCard';
import { analyseProfile } from '@/services/api';
import { setSessionContext } from '@/services/sessionContext';
import { extractPdfText } from '@/utils/pdf';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-navy shadow-sm placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100';

const labelClass = 'mb-2 block text-sm font-medium text-navy';

export default function PreparePage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canSubmit = file !== null && jobTitle.trim() !== '' && jobDescription.trim() !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !file) return;

    setSubmitError(null);
    setIsAnalysing(true);
    try {
      const resumeText = await extractPdfText(file);
      if (!resumeText) {
        setSubmitError('We could not read any text from that PDF. Try a text-based resume instead of a scanned one.');
        setIsAnalysing(false);
        return;
      }

      const analysis = await analyseProfile({ jobTitle, jobDescription, resumeText });
      setSessionContext({
        sessionId: analysis.sessionId,
        jobTitle,
        companyName,
        jobDescription,
        resumeText,
        analysis: { matchScore: analysis.matchScore, skills: analysis.skills },
        questions: [],
      });
      navigate('/interview');
    } catch {
      setSubmitError('We could not analyse your profile. Please check your connection and try again.');
      setIsAnalysing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div>
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">Prepare your interview</h1>
        <p className="mt-4 text-lg text-slate-600">
          Upload your resume and describe the role. We will tailor your practice session to both.
        </p>
      </div>

      <div className="mt-10">
        <StreakCard />
      </div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <section>
            <h2 className="text-lg font-semibold text-navy">1. Your resume</h2>
            <p className="mt-1 text-sm text-slate-600">Upload your current resume as a PDF.</p>
            <div className="mt-5">
              <FileUpload file={file} onChange={setFile} />
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-navy">2. The role</h2>
              <p className="mt-1 text-sm text-slate-600">Tell us what you are applying for.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="job-title" className={labelClass}>
                  Job title <span className="text-red-600">*</span>
                </label>
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setJobTitle(event.target.value)}
                  placeholder="e.g. Senior Product Analyst"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="company-name" className={labelClass}>
                  Company name <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setCompanyName(event.target.value)}
                  placeholder="e.g. Acme Corp"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="job-description" className={labelClass}>
                Job description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="job-description"
                rows={8}
                value={jobDescription}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(event.target.value)}
                placeholder="Paste the full job description here"
                className={`${inputClass} resize-y`}
              />
            </div>
          </section>

          <div className="space-y-3">
            {submitError && (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!canSubmit}
              loading={isAnalysing}
            >
              {isAnalysing ? 'Analysing your profile...' : 'Analyse My Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
