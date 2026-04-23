'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAsgardeo } from '@asgardeo/nextjs';

const PENDING_REDIRECT_KEY = 'asgardeo_pending_redirect';

function Redirect() {
  const { isSignedIn, isLoading } = useAsgardeo();
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasCode = searchParams.has('code');
  const hasState = searchParams.has('state');

  // When OAuth callback params land, mark that a post-login redirect is pending.
  // This must happen before isSignedIn becomes true (SDK processes the callback async).
  useEffect(() => {
    if (hasCode && hasState) {
      console.log('[OAuthCallbackRedirect] OAuth callback params detected — pending redirect set');
      sessionStorage.setItem(PENDING_REDIRECT_KEY, 'true');
    }
  }, [hasCode, hasState]);

  // Once the SDK finishes and isSignedIn is true, consume the pending redirect.
  useEffect(() => {
    if (isLoading || !isSignedIn) return;
    if (sessionStorage.getItem(PENDING_REDIRECT_KEY) === 'true') {
      sessionStorage.removeItem(PENDING_REDIRECT_KEY);
      console.log('[OAuthCallbackRedirect] Sign-in complete — redirecting to /auth/callback');
      router.replace('/auth/callback');
    }
  }, [isSignedIn, isLoading, router]);

  return null;
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
