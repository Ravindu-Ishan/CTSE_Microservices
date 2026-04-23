'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSession } from '@/components/AppSessionContext';
import { PageSpinner } from '@/components/ui/Spinner';

export default function CallbackPage() {
  const { role, isLoading } = useAppSession();
  const router = useRouter();

  useEffect(() => {
    console.log(`[Callback] isLoading=${isLoading} role=${role}`);
    if (isLoading) return;
    const dest = role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/staff' : '/dashboard';
    console.log(`[Callback] Redirecting to ${dest}`);
    router.replace(dest);
  }, [role, isLoading, router]);

  return <PageSpinner />;
}
