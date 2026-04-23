'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTickets } from '@/lib/api/ticket';
import type { Ticket } from '@/lib/types/ticket';
import { TicketStatusBadge, PriorityBadge } from '@/components/ui/Badge';
import Card, { CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function StaffOverviewPage() {
  const { profileId, accessToken, isLoading: sessionLoading } = useAppSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !profileId) return;
    listTickets({ assignedTo: profileId }, accessToken ?? undefined)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [sessionLoading, profileId, accessToken]);

  if (sessionLoading || loading) return <PageSpinner />;

  const openCount = tickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Staff Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your assigned tickets and status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Tickets', value: openCount, color: 'text-blue-400' },
          { label: 'Total Assigned', value: tickets.length, color: 'text-slate-300' },
          { label: 'Resolved', value: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length, color: 'text-green-400' },
        ].map((stat) => (
          <Card key={stat.label} padding="md">
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Active tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Assigned Tickets</CardTitle>
          <Link href="/staff/tickets">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-slate-500 text-sm">No tickets assigned to you yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 6).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/staff/tickets/${ticket.id}`}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 hover:border-blue-500/30 rounded-xl px-5 py-4 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-slate-200 group-hover:text-blue-300 truncate">
                    {ticket.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-xs text-slate-500">{ticket.category}</span>
                  </div>
                </div>
                <TicketStatusBadge status={ticket.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
