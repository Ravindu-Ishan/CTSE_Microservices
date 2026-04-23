'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/user';
import type { Profile } from '@/lib/types/user';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-slate-700/60 last:border-0">
      <span className="text-sm text-slate-400 sm:w-40 shrink-0">{label}</span>
      <span className="text-sm text-slate-200">{value ?? '—'}</span>
    </div>
  );
}

export default function UserProfilePage() {
  const { profileId, accessToken, isLoading: sessionLoading } = useAppSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !profileId) return;
    getProfile(profileId, accessToken ?? undefined)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [sessionLoading, profileId, accessToken]);

  if (sessionLoading || loading) return <PageSpinner />;

  const myAccountUrl = process.env.NEXT_PUBLIC_WSO2_MYACCOUNT_URL;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your Axiom account details.</p>
      </div>

      {profile && (
        <>
          {/* Avatar section */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-slate-400">@{profile.username}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  {profile.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Account Details</CardTitle>
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Username" value={profile.username} />
            <InfoRow label="Phone" value={profile.phoneNumber} />
            <InfoRow label="Timezone" value={profile.timezone} />
            <InfoRow label="Language" value={profile.language} />
            <InfoRow label="Member since" value={new Date(profile.createdAt).toLocaleDateString()} />
            <InfoRow label="Last login" value={profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : undefined} />
          </Card>

          {myAccountUrl && (
            <Card>
              <CardTitle className="mb-1">Update your details</CardTitle>
              <CardDescription className="mb-4">
                Password changes and profile updates are managed through your Axiom account portal.
              </CardDescription>
              <a
                href={myAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg border border-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Axiom Account Portal
              </a>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
