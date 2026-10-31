import { ArrowRight, BarChart3, Gauge, History, ListChecks, MessageSquare, Sparkles, Target, TrendingUp, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '@/components/Badge';
import { buttonStyles } from '@/components/buttonStyles';
import Card from '@/components/Card';
import ScoreChip from '@/components/ScoreChip';
import { sampleFeedbackByQuestion } from '@/data/sampleData';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Add your resume as a PDF and paste the job description for the role you want.',
  },
  {
    icon: MessageSquare,
    title: 'Practise Personalised Interviews',
    description: 'Answer questions shaped by your experience, the role and the company.',
  },
  {
    icon: TrendingUp,
    title: 'Improve Your Performance',
    description: 'Get scored feedback, a stronger sample answer and a clear view of your progress.',
  },
];

const features: Feature[] = [
  {
    icon: Target,
    title: 'Personalised questions',
    description: 'Questions drawn from your resume and the specific job you are applying for.',
  },
  {
    icon: Sparkles,
    title: 'AI answer feedback',
    description: 'Scores for relevance, clarity, structure and job alignment on every answer.',
  },
  {
    icon: ListChecks,
    title: 'STAR framework coaching',
    description: 'Behavioural answers are checked for Situation, Task, Action and Result.',
  },
  {
    icon: Gauge,
    title: 'Job match score',
    description: 'See how closely your background lines up with the role before you start.',
  },
  {
    icon: BarChart3,
    title: 'Performance report',
    description: 'A summary of your strongest areas and what to practise next.',
  },
  {
    icon: History,
    title: 'Session history',
    description: 'Revisit past practice sessions and track how your answers improve.',
  },
];

export default function LandingPage() {
  const previewScores = sampleFeedbackByQuestion.q3.scores;

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <Badge tone="blue">AI-powered interview preparation</Badge>
          <h1 className="mt-6 text-4xl font-semibold text-navy sm:text-5xl lg:text-6xl">
            Your Resume. Your Role.{' '}
            <span className="text-brand-600">Your Interview Coach.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600">
            Upload your resume and the job you want. InterviewIQ builds practice questions around your
            real experience, scores your answers and shows you exactly how to make them stronger.
          </p>
          <div className="mt-10">
            <Link to="/prepare" className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}>
              Start Preparing
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <Card className="transition-shadow duration-300 hover:shadow-lift">
          <div className="flex items-center justify-between">
            <Badge tone="emerald">Sample feedback</Badge>
            <span className="text-sm text-slate-500">Question 3 of 5</span>
          </div>
          <p className="mt-5 text-lg font-medium leading-snug text-navy">
            Tell me about a time you had to deliver under a tight deadline. What did you do?
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <ScoreChip label="Relevance" score={previewScores.relevance} />
            <ScoreChip label="Clarity" score={previewScores.clarity} />
            <ScoreChip label="Structure" score={previewScores.structure} />
            <ScoreChip label="Job Alignment" score={previewScores.jobAlignment} />
          </div>
        </Card>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-navy sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-slate-600">Three simple steps from your resume to a confident interview.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-slate-400">0{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-navy">{step.title}</h3>
                  <p className="mt-2 text-base text-slate-600">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-navy sm:text-4xl">Everything you need to prepare</h2>
          <p className="mt-4 text-lg text-slate-600">Focused tools that help you practise, learn and improve.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="transition-shadow duration-300 hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
