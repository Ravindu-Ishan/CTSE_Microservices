'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'Server configuration error. Please contact support.',
  AccessDenied: 'Access was denied. You may not have permission to sign in.',
  Verification: 'The verification link has expired or is invalid.',
  Default: 'An unexpected error occurred during sign in. Please try again.',
};

function ErrorContent() {
  const params = useSearchParams();
  const errorCode = params.get('error') ?? 'Default';
  const message = errorMessages[errorCode] ?? errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-block mb-10">
          <span className="text-4xl font-black tracking-tighter text-white">
            AXIO<span className="text-blue-400">M</span>
          </span>
        </Link>

        <div className="bg-slate-800 border border-red-400/20 rounded-2xl p-8">
          <div className="w-12 h-12 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Sign In Failed</h1>
          <p className="text-sm text-slate-400 mb-8">{message}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </Link>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
