'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAsgardeo } from '@asgardeo/nextjs';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const { signIn, isSignedIn } = useAsgardeo();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace('/auth/callback');
  }, [isSignedIn, router]);

  const handleLogin = async () => {
    setLoading(true);
    await signIn?.();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg-base">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <span className="text-4xl font-black tracking-tighter text-white">
              AXIO<span className="text-blue-400">M</span>
            </span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Support Portal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-8">
            Sign in with your Axiom account to access support.
          </p>

          <Button
            onClick={handleLogin}
            loading={loading}
            size="lg"
            className="w-full justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {loading ? 'Redirecting…' : 'Continue with Axiom Account'}
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          By continuing you agree to our{' '}
          <a href="#" className="underline hover:text-slate-400">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-slate-400">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
