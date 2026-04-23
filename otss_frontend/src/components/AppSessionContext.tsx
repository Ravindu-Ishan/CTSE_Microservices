'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAsgardeo } from '@asgardeo/nextjs';
import { listProfiles } from '@/lib/api/user';
import type { UserRole } from '@/lib/types/user';

interface AppSession {
  role: UserRole | null;
  profileId: string | null;
  accessToken: string | null;
  displayName: string | null;
  isLoading: boolean;
}

const defaultSession: AppSession = {
  role: null,
  profileId: null,
  accessToken: null,
  displayName: null,
  isLoading: true,
};

const AppSessionContext = createContext<AppSession>(defaultSession);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoading: sdkLoading } = useAsgardeo();
  const [session, setSession] = useState<AppSession>(defaultSession);

  useEffect(() => {
    console.log(`[AppSession] State — sdkLoading=${sdkLoading} isSignedIn=${isSignedIn}`);
    if (sdkLoading) return;

    if (!isSignedIn) {
      console.log('[AppSession] Not signed in — clearing session');
      setSession({ ...defaultSession, isLoading: false });
      return;
    }

    let cancelled = false;

    async function load() {
      console.log('[AppSession] Signed in — fetching session from /api/session...');
      try {
        const res = await fetch('/api/session');
        if (!res.ok) throw new Error(`/api/session returned ${res.status}`);
        const data = await res.json();
        console.log('[AppSession] /api/session response:', data);

        if (cancelled) return;
        if (!data.isSignedIn) {
          setSession({ ...defaultSession, isLoading: false });
          return;
        }

        const { accessToken, role, email, displayName } = data as {
          accessToken: string;
          role: UserRole | null;
          email: string;
          displayName: string;
        };

        // Fetch profileId from User Service using the server-issued access token
        let profileId: string | null = null;
        try {
          console.log(`[AppSession] Fetching profile for email=${email}...`);
          const profiles = await listProfiles({ email }, accessToken);
          if (!cancelled) profileId = profiles[0]?.id ?? null;
          console.log(`[AppSession] profileId=${profileId}`);
        } catch (err) {
          console.error('[AppSession] Profile fetch failed:', err);
        }

        if (!cancelled) {
          console.log(`[AppSession] Session ready — role=${role} profileId=${profileId}`);
          setSession({ role, profileId, accessToken, displayName, isLoading: false });
        }
      } catch (err) {
        console.error('[AppSession] Session load failed:', err);
        if (!cancelled) setSession({ ...defaultSession, isLoading: false });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isSignedIn, sdkLoading]);

  return (
    <AppSessionContext.Provider value={session}>
      {children}
    </AppSessionContext.Provider>
  );
}

export function useAppSession() {
  return useContext(AppSessionContext);
}
