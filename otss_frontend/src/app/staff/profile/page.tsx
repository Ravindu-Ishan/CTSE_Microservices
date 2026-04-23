'use client';

import { useEffect, useState } from 'react';
import { getProfile, updateStaffStatus } from '@/lib/api/user';
import type { Profile } from '@/lib/types/user';
import type { TicketCategory } from '@/lib/types/ticket';
import Card, { CardTitle, CardDescription } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

const CATEGORIES: TicketCategory[] = ['IT', 'BILLING', 'ACCESS', 'OTHER'];

export default function StaffProfilePage() {
  const { profileId, accessToken, isLoading: sessionLoading } = useAppSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (sessionLoading || !profileId) return;
    getProfile(profileId, accessToken ?? undefined)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [sessionLoading, profileId, accessToken]);

  const handleToggleOnline = async () => {
    if (!profile || !profileId) return;
    setSaving(true);
    try {
      const updated = await updateStaffStatus(profileId, {
        isOnline: !profile.staffStatus?.isOnline,
      }, accessToken ?? undefined);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (cat: TicketCategory) => {
    if (!profile?.staffStatus || !profileId) return;
    const current = profile.staffStatus.categories;
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setSaving(true);
    try {
      const res = await updateStaffStatus(profileId, { categories: updated }, accessToken ?? undefined);
      setProfile(res);
    } finally {
      setSaving(false);
    }
  };

  const handleCapacityChange = async (maxLoad: number) => {
    if (!profileId) return;
    setSaving(true);
    try {
      const res = await updateStaffStatus(profileId, { maxLoad }, accessToken ?? undefined);
      setProfile(res);
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) return <PageSpinner />;

  const ss = profile?.staffStatus;
  const myAccountUrl = process.env.NEXT_PUBLIC_WSO2_MYACCOUNT_URL;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Staff Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your availability and ticket categories.</p>
      </div>

      {profile && (
        <>
          {/* Identity */}
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-slate-400">@{profile.username} · {profile.email}</p>
              </div>
            </div>
          </Card>

          {/* Online status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="mb-1">Availability</CardTitle>
                <CardDescription>
                  {ss?.isOnline ? 'You are currently online and receiving tickets.' : 'You are offline. No new tickets will be assigned.'}
                </CardDescription>
              </div>
              <button
                onClick={handleToggleOnline}
                disabled={saving}
                className={[
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none',
                  ss?.isOnline ? 'bg-green-500' : 'bg-slate-600',
                  saving ? 'opacity-50 cursor-not-allowed' : '',
                ].join(' ')}
                aria-label="Toggle online status"
              >
                <span
                  className={[
                    'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                    ss?.isOnline ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>
            {saved && <p className="text-xs text-green-400 mt-2">Status updated.</p>}
          </Card>

          {/* Categories */}
          <Card>
            <CardTitle className="mb-1">Ticket Categories</CardTitle>
            <CardDescription className="mb-4">Select which types of tickets you can handle.</CardDescription>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const active = ss?.categories?.includes(cat) ?? false;
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    disabled={saving}
                    className={[
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                      active
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/60 hover:bg-slate-700',
                    ].join(' ')}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Capacity */}
          <Card>
            <CardTitle className="mb-1">Capacity</CardTitle>
            <CardDescription className="mb-4">
              Current load: {ss?.currentLoad ?? 0} / {ss?.maxLoad ?? 5} tickets
            </CardDescription>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-slate-400">Max tickets:</span>
              {[2, 5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCapacityChange(n)}
                  disabled={saving}
                  className={[
                    'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                    ss?.maxLoad === n
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-700/40 text-slate-400 border-slate-600/60 hover:bg-slate-700',
                  ].join(' ')}
                >
                  {n}
                </button>
              ))}
            </div>
          </Card>

          {myAccountUrl && (
            <Card>
              <CardTitle className="mb-1">Account Settings</CardTitle>
              <CardDescription className="mb-4">
                Update your password and personal details via the account portal.
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
                Open Account Portal
              </a>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
