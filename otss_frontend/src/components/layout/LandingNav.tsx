'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/patch-notes', label: 'Patch Notes' },
  { href: '/about', label: 'About' },
  { href: '/auth/login', label: 'Support', highlight: true },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter text-white">
              AXIO<span className="text-blue-400">M</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="ml-4 px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    active
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60',
                  ].join(' ')}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-700/60 bg-slate-900/95 px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={[
                'px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                link.highlight
                  ? 'bg-blue-500 text-white text-center'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
