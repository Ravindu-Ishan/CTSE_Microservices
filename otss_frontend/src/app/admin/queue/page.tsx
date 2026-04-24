'use client';

import { useEffect, useState } from 'react';
import { listQueue, getQueueStats, manualAssign } from '@/lib/api/queue';
import { listStaff } from '@/lib/api/user';
import { getTicket } from '@/lib/api/ticket';
import type { QueueEntry, QueueStats } from '@/lib/types/queue';
import type { StaffStatusWithProfile } from '@/lib/types/user';
import type { Ticket } from '@/lib/types/ticket';
import { QueueStatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import Card, { CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import Spinner from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function AdminQueuePage() {
  const { accessToken, isLoading: sessionLoading } = useAppSession();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [staffMap, setStaffMap] = useState<Map<string, string>>(new Map());

  // Assign modal state
  const [assignTarget, setAssignTarget] = useState<QueueEntry | null>(null);
  const [ticketDetails, setTicketDetails] = useState<Ticket | null>(null);
  const [staffList, setStaffList] = useState<StaffStatusWithProfile[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [staffSearch, setStaffSearch] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const fetchData = (token?: string) => {
    setLoading(true);
    Promise.all([
      listQueue({ limit: 50 }, token),
      getQueueStats(token),
      listStaff({ limit: 50 }, token),
    ])
      .then(([q, s, staff]) => {
        setEntries(q.entries);
        setStats(s);
        const map = new Map<string, string>();
        staff.forEach((s) => {
          const name = [s.profile.firstName, s.profile.lastName].filter(Boolean).join(' ') || s.profile.username;
          map.set(s.profileId, name);
        });
        setStaffMap(map);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (sessionLoading || !accessToken) return;
    fetchData(accessToken);
  }, [sessionLoading, accessToken]);

  const openAssignModal = async (entry: QueueEntry) => {
    setAssignTarget(entry);
    setTicketDetails(null);
    setSelectedStaffId(null);
    setStaffSearch('');
    setAssignError('');
    setStaffLoading(true);
    try {
      const [ticket, staff] = await Promise.all([
        getTicket(entry.ticketId, accessToken ?? undefined),
        listStaff({ category: entry.ticketCategory, limit: 50 }, accessToken ?? undefined),
      ]);
      setTicketDetails(ticket);
      setStaffList(staff);
    } catch {
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedStaffId) {
      setAssignError('Please select a staff member.');
      return;
    }
    setAssigning(true);
    setAssignError('');
    try {
      await manualAssign(assignTarget.ticketId, { staffId: selectedStaffId }, accessToken ?? undefined);
      setAssignTarget(null);
      fetchData(accessToken ?? undefined);
    } catch {
      setAssignError('Assignment failed. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  if (sessionLoading || loading) return <PageSpinner />;

  const statCards = stats
    ? [
        { label: 'Pending', value: stats.pending, color: 'text-yellow-300' },
        { label: 'Assigned', value: stats.assigned, color: 'text-blue-400' },
        { label: 'Completed', value: stats.completed, color: 'text-green-400' },
        { label: 'Failed', value: stats.failed, color: 'text-red-400' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Queue Management</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and manually assign pending tickets.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => fetchData(accessToken ?? undefined)}>Refresh</Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Queue table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-slate-700">
          <CardTitle>Queue Entries</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="px-6 py-3 font-medium">Ticket ID</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Queue is empty.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-700/40 hover:bg-slate-800/30">
                    <td className="px-6 py-3 text-xs text-slate-400 font-mono">{entry.ticketId.slice(0, 8)}…</td>
                    <td className="px-4 py-3"><CategoryBadge category={entry.ticketCategory} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={entry.ticketPriority} /></td>
                    <td className="px-4 py-3"><QueueStatusBadge status={entry.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {entry.assignedStaffId
                        ? (staffMap.get(entry.assignedStaffId) ?? entry.assignedStaffId.slice(0, 8) + '…')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      {entry.status === 'PENDING' || entry.status === 'FAILED' ? (
                        <Button size="sm" variant="secondary" onClick={() => openAssignModal(entry)} className="w-24">
                          Assign
                        </Button>
                      ) : entry.status === 'ASSIGNED' ? (
                        <Button size="sm" variant="warning" onClick={() => openAssignModal(entry)} className="w-24">
                          Reassign
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-600 inline-block w-24 text-center">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual assign modal */}
      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={assignTarget?.status === 'ASSIGNED' ? 'Reassign Ticket' : 'Assign Ticket'}
        maxWidth="2xl"
      >
        {/* Ticket details panel */}
        <div className="bg-slate-700/40 border border-slate-600/50 rounded-lg p-4 mb-5">
          {ticketDetails ? (
            <>
              <p className="text-slate-100 font-semibold text-sm mb-1">{ticketDetails.title}</p>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{ticketDetails.description}</p>
              {assignTarget?.assignedStaffId && (
                <p className="text-xs text-slate-400 mt-2">
                  Currently assigned to:{' '}
                  <span className="text-slate-200 font-medium">
                    {staffMap.get(assignTarget.assignedStaffId) ?? assignTarget.assignedStaffId.slice(0, 8) + '…'}
                  </span>
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-slate-500">
                  Opened {new Date(ticketDetails.createdAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  <CategoryBadge category={assignTarget?.ticketCategory ?? 'IT'} />
                  <PriorityBadge priority={assignTarget?.ticketPriority ?? 'LOW'} />
                  {assignTarget && <QueueStatusBadge status={assignTarget.status} />}
                </div>
              </div>
            </>
          ) : (
            <div className="h-16 flex items-center">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Staff who handle <strong className="text-slate-400">{assignTarget?.ticketCategory}</strong> tickets. Online staff shown first.
        </p>

        <input
          type="text"
          value={staffSearch}
          onChange={(e) => { setStaffSearch(e.target.value); }}
          placeholder="Search by name or username…"
          disabled={staffLoading}
          className="w-full mb-3 px-3 py-2 text-sm bg-slate-700/60 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-40"
        />
        <div className="h-52 overflow-y-auto pr-1">
        {staffLoading ? (
          <div className="h-full flex items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : staffList.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm">No staff found for this category.</p>
          </div>
        ) : (
          <div className="space-y-2">
              {[...staffList]
                .sort((a, b) => Number(b.isOnline) - Number(a.isOnline))
                .filter((s) => {
                  if (!staffSearch.trim()) return true;
                  const q = staffSearch.toLowerCase();
                  const name = [s.profile.firstName, s.profile.lastName].join(' ').toLowerCase();
                  return name.includes(q) || s.profile.username.toLowerCase().includes(q);
                })
                .map((s) => {
                  const name = [s.profile.firstName, s.profile.lastName].filter(Boolean).join(' ') || s.profile.username;
                  const isSelected = selectedStaffId === s.profileId;
                  const loadPct = s.maxLoad > 0 ? Math.round((s.currentLoad / s.maxLoad) * 100) : 0;
                  return (
                    <button
                      key={s.profileId}
                      onClick={() => { setSelectedStaffId(s.profileId); setAssignError(''); }}
                      className={[
                        'w-full text-left px-4 py-3 rounded-lg border transition-colors',
                        isSelected
                          ? 'bg-blue-500/15 border-blue-500/50 text-slate-100'
                          : 'bg-slate-700/40 border-slate-600/50 text-slate-300 hover:bg-slate-700/70',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={['inline-block w-2 h-2 rounded-full shrink-0', s.isOnline ? 'bg-green-400' : 'bg-slate-500'].join(' ')} />
                            <p className="font-medium text-sm truncate">{name}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 pl-4">@{s.profile.username} · {s.isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400">
                            Load: <span className={loadPct >= 80 ? 'text-yellow-300' : 'text-green-400'}>{s.currentLoad}/{s.maxLoad}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.categories.join(', ')}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
        )}
        </div>

        {assignError && (
          <p className="text-xs text-red-400 mt-3">{assignError}</p>
        )}

        <div className="flex gap-3 justify-end mt-5">
          <Button variant="ghost" onClick={() => setAssignTarget(null)} disabled={assigning}>Cancel</Button>
          <Button loading={assigning} onClick={handleAssign} disabled={!selectedStaffId || staffLoading}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
}
