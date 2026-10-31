import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/prepare', label: 'Practice' },
  { to: '/history', label: 'History' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-sm text-slate-600">Your Resume. Your Role. Your Interview Coach.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-slate-500">© 2026 InterviewIQ. All rights reserved.</p>
      </div>
    </footer>
  );
}
