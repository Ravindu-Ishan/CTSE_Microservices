'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getTicket, getMessages } from '@/lib/api/ticket';
import { getQueueEntry } from '@/lib/api/queue';
import type { Ticket, TicketMessage } from '@/lib/types/ticket';
import type { QueueEntry } from '@/lib/types/queue';
import { TicketStatusBadge, PriorityBadge, CategoryBadge, QueueStatusBadge } from '@/components/ui/Badge';
import MessageThread from '@/components/tickets/MessageThread';
import Button from '@/components/ui/Button';
import Card, { CardTitle } from '@/components/ui/Card';
import { PageSpinner } from '@/components/ui/Spinner';

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTicket(id),
      getMessages(id),
      getQueueEntry(id).catch(() => null),
    ]).then(([t, m, q]) => {
      setTicket(t);
      setMessages(m);
      setQueueEntry(q);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!ticket) return <p className="text-slate-400">Ticket not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/tickets">
        <Button variant="ghost" size="sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tickets
        </Button>
      </Link>

      {/* Ticket header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <h1 className="text-xl font-semibold text-slate-100 flex-1">{ticket.title}</h1>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <CategoryBadge category={ticket.category} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{ticket.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
          <span>Created by: <code className="text-slate-400">{ticket.createdBy}</code></span>
          <span>Assigned to: <code className="text-slate-400">{ticket.assignedTo ?? 'Unassigned'}</code></span>
          <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
          <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
        </div>
      </Card>

      {/* Queue entry */}
      {queueEntry && (
        <Card>
          <CardTitle className="mb-4">Queue Entry</CardTitle>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-slate-400 text-xs block">Queue Status</span>
              <QueueStatusBadge status={queueEntry.status} />
            </div>
            <div>
              <span className="text-slate-400 text-xs block">Assigned At</span>
              <span className="text-slate-200">{queueEntry.assignedAt ? new Date(queueEntry.assignedAt).toLocaleString() : '—'}</span>
            </div>
          </div>
          {(queueEntry.status === 'PENDING' || queueEntry.status === 'FAILED') && (
            <div className="mt-4">
              <Link href="/admin/queue">
                <Button variant="secondary" size="sm">Assign from Queue Page</Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* Messages */}
      <Card>
        <h2 className="text-base font-semibold text-slate-200 mb-6">Conversation ({messages.length} messages)</h2>
        <MessageThread messages={messages} />
      </Card>
    </div>
  );
}
