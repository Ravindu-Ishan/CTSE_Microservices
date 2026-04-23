'use client';

import { useEffect, useState } from 'react';
import { listQueue, getQueueStats, manualAssign } from '@/lib/api/queue';
import type { QueueEntry, QueueStats } from '@/lib/types/queue';
import { QueueStatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import Card, { CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';

export default function AdminQueuePage() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<QueueEntry | null>(null);
  const [staffId, setStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([listQueue({ limit: 50 }), getQueueStats()])
      .then(([q, s]) => {
        setEntries(q.entries);
        setStats(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async () => {
    if (!assignTarget || !staffId.trim()) {
      setAssignError('Staff ID is required.');
      return;
    }
    setAssigning(true);
    setAssignError('');
    try {
      await manualAssign(assignTarget.ticketId, { staffId: staffId.trim() });
      setAssignTarget(null);
      setStaffId('');
      fetchData();
    } catch {
      setAssignError('Assignment failed. Check the staff ID and try again.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <PageSpinner />;

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
        <Button variant="secondary" size="sm" onClick={fetchData}>Refresh</Button>
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
                <th className="px-4 py-3 font-medium">Action</th>
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
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {entry.assignedStaffId ? entry.assignedStaffId.slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {entry.status === 'PENDING' || entry.status === 'FAILED' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => { setAssignTarget(entry); setAssignError(''); setStaffId(''); }}
                        >
                          Assign
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
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
        title="Manually Assign Ticket"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-400 mb-4">
          Assign ticket <code className="text-blue-300 text-xs">{assignTarget?.ticketId.slice(0, 8)}…</code> to a staff member.
        </p>
        <Input
          label="Staff Profile ID"
          value={staffId}
          onChange={(e) => { setStaffId(e.target.value); setAssignError(''); }}
          placeholder="Enter the staff member's UUID"
          error={assignError}
        />
        <div className="flex gap-3 justify-end mt-6">
          <Button variant="ghost" onClick={() => setAssignTarget(null)}>Cancel</Button>
          <Button loading={assigning} onClick={handleAssign}>Assign</Button>
        </div>
      </Modal>
    </div>
  );
}
