'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTickets } from '@/lib/api/ticket';
import type { Ticket } from '@/lib/types/ticket';
import TicketList from '@/components/tickets/TicketList';
import Button from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function UserTicketsPage() {
  const { profileId, accessToken, isLoading: sessionLoading } = useAppSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !profileId) return;
    listTickets({ createdBy: profileId }, accessToken ?? undefined)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [sessionLoading, profileId, accessToken]);

  if (sessionLoading || loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Tickets</h1>
          <p className="text-slate-400 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Button>
        </Link>
      </div>
      <TicketList tickets={tickets} hrefPrefix="/dashboard/tickets" />
    </div>
  );
}
