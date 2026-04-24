'use client';

import { useEffect, useState } from 'react';
import { listTickets } from '@/lib/api/ticket';
import type { Ticket, TicketStatus, TicketCategory } from '@/lib/types/ticket';
import { TicketStatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'IT', label: 'IT' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'ACCESS', label: 'Access' },
  { value: 'OTHER', label: 'Other' },
];

export default function AdminTicketsPage() {
  const { accessToken, isLoading: sessionLoading } = useAppSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (sessionLoading || !accessToken) return;
    listTickets({ limit: 100 }, accessToken)
      .then(setTickets)
      .finally(() => setLoading(false));
  }, [sessionLoading, accessToken]);

  if (sessionLoading || loading) return <PageSpinner />;

  const filtered = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">All Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} tickets</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
          className="sm:w-44"
        />
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | '')}
          className="sm:w-44"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-700">
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">No tickets found.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-700/40 hover:bg-slate-800/30">
                    <td className="px-6 py-3">
                      <Link href={`/admin/tickets/${t.id}`} className="text-slate-200 hover:text-blue-300 transition-colors font-medium block truncate max-w-[220px]">
                        {t.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><CategoryBadge category={t.category} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-4 py-3"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
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
