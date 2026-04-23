'use client';

import { useEffect, useState } from 'react';
import { listProfiles } from '@/lib/api/user';
import type { Profile, UserRole } from '@/lib/types/user';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'END_USER', label: 'End Users' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ADMIN', label: 'Admin' },
];

const roleBadgeVariant = {
  END_USER: 'neutral',
  STAFF: 'info',
  ADMIN: 'warning',
} as const;

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    listProfiles()
      .then(setProfiles)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const filtered = profiles.filter((p) => !roleFilter || p.role === roleFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Users</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} users</p>
      </div>

      <Select
        options={roleOptions}
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
        className="sm:w-44"
      />

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Staff Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">No users found.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-700/40 hover:bg-slate-800/30">
                    <td className="px-6 py-3">
                      <div>
                        <span className="font-medium text-slate-200">{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">@{p.username}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadgeVariant[p.role]}>
                        {p.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.staffStatus ? (
                        <span className={`text-xs font-medium ${p.staffStatus.isOnline ? 'text-green-400' : 'text-slate-500'}`}>
                          {p.staffStatus.isOnline ? '● Online' : '○ Offline'}
                          {' '}({p.staffStatus.currentLoad}/{p.staffStatus.maxLoad})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
