import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { signInWithEmail } from '@/services/auth';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-navy shadow-sm placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100';

const labelClass = 'mb-2 block text-sm font-medium text-navy';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const error = await signInWithEmail(email.trim(), password);
    if (error) {
      setSubmitError(error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">Welcome back</h1>
        <p className="mt-4 text-base text-slate-600">Sign in to continue your interview practice.</p>
      </div>

      <Card className="mt-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="sign-in-email" className={labelClass}>
              Email
            </label>
            <input
              id="sign-in-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="sign-in-password" className={labelClass}>
              Password
            </label>
            <input
              id="sign-in-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              placeholder="Your password"
              className={inputClass}
            />
          </div>

          <div className="space-y-3">
            {submitError && (
              <p role="alert" className="text-sm text-red-600">
                {submitError}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth disabled={!canSubmit} loading={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to InterviewIQ?{' '}
        <Link to="/signup" className="font-medium text-brand-700 transition-colors hover:text-navy">
          Create an account
        </Link>
      </p>
    </div>
  );
}
