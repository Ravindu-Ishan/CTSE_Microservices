'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTickets } from '@/lib/api/ticket';
import { getNotificationsByUser } from '@/lib/api/notification';
import type { Ticket } from '@/lib/types/ticket';
import type { NotificationLog } from '@/lib/types/notification';
import { TicketStatusBadge } from '@/components/ui/Badge';
import Card, { CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function DashboardPage() {
  const { profileId, accessToken, displayName, isLoading: sessionLoading } = useAppSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!profileId) { setLoading(false); return; }
    Promise.all([
      listTickets({ createdBy: profileId, limit: 5 }, accessToken ?? undefined),
      getNotificationsByUser(profileId, undefined, accessToken ?? undefined).catch(() => [] as NotificationLog[]),
    ]).then(([t, n]) => {
      setTickets(t);
      setNotifications(n.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [sessionLoading, profileId, accessToken]);

  if (sessionLoading || loading) return <PageSpinner />;

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Welcome back, {displayName?.split(' ')[0] ?? 'Player'}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here&apos;s what&apos;s happening with your support tickets.</p>
        </div>
        <Link href="/dashboard/tickets/new" className="shrink-0 mt-1">
          <Button size="lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Open Tickets', value: openCount, color: 'text-blue-400' },
          { label: 'In Progress', value: inProgressCount, color: 'text-yellow-300' },
          { label: 'Total', value: tickets.length, color: 'text-slate-300' },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Recent Tickets</CardTitle>
          <Link href="/dashboard/tickets">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>
        {tickets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500 mb-4 text-sm">You haven&apos;t raised any tickets yet.</p>
            <Link href="/dashboard/tickets/new">
              <Button size="sm">Open a Ticket</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 hover:border-blue-500/30 rounded-xl px-5 py-4 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-blue-300 truncate">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{ticket.category}</p>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div>
          <CardTitle className="mb-4">Recent Notifications</CardTitle>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-3 flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.status === 'SENT' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div>
                  <p className="text-sm text-slate-300">{n.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(n.sentAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
