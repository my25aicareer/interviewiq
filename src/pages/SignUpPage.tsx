import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { signUpWithEmail } from '@/services/auth';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-navy shadow-sm placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100';

const labelClass = 'mb-2 block text-sm font-medium text-navy';

const MIN_PASSWORD_LENGTH = 8;

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && confirmPassword !== '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    if (password.length < MIN_PASSWORD_LENGTH) {
      setSubmitError(`Your password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('The passwords do not match. Please re-enter them.');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    const result = await signUpWithEmail(email.trim(), password);
    if (result.error) {
      setSubmitError(result.error);
      setIsSubmitting(false);
      return;
    }
    if (result.requiresConfirmation) {
      setNeedsConfirmation(true);
      setIsSubmitting(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Card className="text-center">
          <h1 className="text-2xl font-semibold text-navy">Check your email</h1>
          <p className="mt-4 text-base text-slate-600">
            We sent a confirmation link to <span className="font-medium text-navy">{email.trim()}</span>. Open it to
            activate your account, then sign in.
          </p>
          <Link to="/login" className="mt-8 inline-block font-medium text-brand-700 transition-colors hover:text-navy">
            Go to sign in
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">Create your account</h1>
        <p className="mt-4 text-base text-slate-600">Save your practice history and reports in one place.</p>
      </div>

      <Card className="mt-10">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="sign-up-email" className={labelClass}>
              Email
            </label>
            <input
              id="sign-up-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="sign-up-password" className={labelClass}>
              Password
            </label>
            <input
              id="sign-up-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="sign-up-confirm-password" className={labelClass}>
              Confirm password
            </label>
            <input
              id="sign-up-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
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
              {isSubmitting ? 'Creating your account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 transition-colors hover:text-navy">
          Sign in
        </Link>
      </p>
    </div>
  );
}
