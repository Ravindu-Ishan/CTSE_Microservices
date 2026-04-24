'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAsgardeo } from '@asgardeo/nextjs';
import Spinner from '@/components/ui/Spinner';

const PENDING_REDIRECT_KEY = 'asgardeo_pending_redirect';

function Redirect() {
  const { isSignedIn, isLoading } = useAsgardeo();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);

  const hasCode = searchParams.has('code');
  const hasState = searchParams.has('state');

  // When OAuth callback params land, mark that a post-login redirect is pending.
  // This must happen before isSignedIn becomes true (SDK processes the callback async).
  useEffect(() => {
    if (hasCode && hasState) {
      console.log('[OAuthCallbackRedirect] OAuth callback params detected — pending redirect set');
      sessionStorage.setItem(PENDING_REDIRECT_KEY, 'true');
      setPending(true);
    } else if (sessionStorage.getItem(PENDING_REDIRECT_KEY) === 'true') {
      setPending(true);
    }
  }, [hasCode, hasState]);

  // Once the SDK finishes and isSignedIn is true, consume the pending redirect.
  useEffect(() => {
    if (isLoading || !isSignedIn) return;
    if (sessionStorage.getItem(PENDING_REDIRECT_KEY) === 'true') {
      sessionStorage.removeItem(PENDING_REDIRECT_KEY);
      setPending(false);
      console.log('[OAuthCallbackRedirect] Sign-in complete — redirecting to /auth/callback');
      router.replace('/auth/callback');
    }
  }, [isSignedIn, isLoading, router]);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900">
      <span className="text-2xl font-black tracking-tighter text-white mb-8">
        AXIO<span className="text-blue-400">M</span>
      </span>
      <Spinner size="lg" />
      <p className="mt-4 text-sm text-slate-400">Signing you in…</p>
    </div>
  );
}

// Suspense required because useSearchParams() opts the component into
// client-side rendering, which Next.js enforces with a Suspense boundary.
export default function OAuthCallbackRedirect() {
  return (
    <Suspense>
      <Redirect />
    </Suspense>
  );
}
