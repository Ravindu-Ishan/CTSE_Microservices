'use client';

import { useEffect, useState } from 'react';
import { listTickets } from '@/lib/api/ticket';
import type { Ticket } from '@/lib/types/ticket';
import TicketList from '@/components/tickets/TicketList';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function StaffTicketsPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Assigned Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} assigned to you</p>
      </div>
      <TicketList tickets={tickets} hrefPrefix="/staff/tickets" />
    </div>
  );
}
