import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from '@/components/Logo';
import StreakBadge from '@/components/StreakBadge';
import { buttonStyles } from '@/components/buttonStyles';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/prepare', label: 'Practice', end: false },
  { to: '/history', label: 'History', end: false },
];

function linkClass(isActive: boolean, isMobile: boolean) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-navy',
    isMobile ? 'block' : '',
  ].join(' ');
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleSignOut() {
    closeMenu();
    void signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => linkClass(isActive, false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <StreakBadge />
          {user ? (
            <button type="button" onClick={handleSignOut} className={`hidden md:inline-flex ${buttonStyles({ variant: 'ghost', size: 'md' })}`}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <Link to="/login" className={`hidden md:inline-flex ${buttonStyles({ variant: 'secondary', size: 'md' })}`}>
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy transition-colors hover:bg-slate-100 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav id="mobile-menu" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) => linkClass(isActive, true)}
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button type="button" onClick={handleSignOut} className={linkClass(false, true)}>
                Sign out
              </button>
            ) : (
              <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => linkClass(isActive, true)}>
                Sign in
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
