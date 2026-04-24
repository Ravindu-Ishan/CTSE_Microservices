'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQueueStats } from '@/lib/api/queue';
import { listTickets } from '@/lib/api/ticket';
import type { QueueStats } from '@/lib/types/queue';
import type { Ticket } from '@/lib/types/ticket';
import Card, { CardTitle } from '@/components/ui/Card';
import { TicketStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [recent, setRecent] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getQueueStats(),
      listTickets({ limit: 8 }),
    ]).then(([s, t]) => {
      setStats(s);
      setRecent(t);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const statCards = stats
    ? [
        { label: 'Pending', value: stats.pending, color: 'text-yellow-300' },
        { label: 'Assigned', value: stats.assigned, color: 'text-blue-400' },
        { label: 'Completed', value: stats.completed, color: 'text-green-400' },
        { label: 'Failed', value: stats.failed, color: 'text-red-400' },
        { label: 'Total', value: stats.total, color: 'text-slate-300' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">System overview and queue health.</p>
      </div>

      {/* Queue stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Queue Stats</CardTitle>
          <Link href="/admin/queue"><Button variant="ghost" size="sm">Manage Queue</Button></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} padding="md">
              <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Recent Tickets</CardTitle>
          <Link href="/admin/tickets"><Button variant="ghost" size="sm">View all</Button></Link>
        </div>
        {recent.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500 text-sm">No tickets found.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-700">
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-slate-700/40 hover:bg-slate-800/40">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/tickets/${t.id}`} className="text-slate-200 hover:text-blue-300 transition-colors font-medium truncate block max-w-[200px]">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{t.category}</td>
                    <td className="py-3 pr-4"><PriorityBadge priority={t.priority} /></td>
                    <td className="py-3 pr-4"><TicketStatusBadge status={t.status} /></td>
                    <td className="py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
