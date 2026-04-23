'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getTicket, getMessages, addMessage, closeTicket } from '@/lib/api/ticket';
import type { Ticket, TicketMessage } from '@/lib/types/ticket';
import { TicketStatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/Badge';
import MessageThread from '@/components/tickets/MessageThread';
import MessageInput from '@/components/tickets/MessageInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { PageSpinner } from '@/components/ui/Spinner';
import { useAppSession } from '@/components/AppSessionContext';

export default function StaffTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profileId, accessToken } = useAppSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    Promise.all([
      getTicket(id, accessToken ?? undefined),
      getMessages(id, accessToken ?? undefined),
    ])
      .then(([t, m]) => {
        setTicket(t);
        setMessages(m);
      })
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const handleSend = async (content: string) => {
    if (!profileId) return;
    const msg = await addMessage(id, {
      content,
      authorId: profileId,
      authorRole: 'STAFF',
    }, accessToken ?? undefined);
    setMessages((prev) => [...prev, msg]);
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      const updated = await closeTicket(id, accessToken ?? undefined);
      setTicket(updated);
      setConfirmClose(false);
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!ticket) return <p className="text-slate-400">Ticket not found.</p>;

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/staff/tickets">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        {!isClosed && (
          <Button variant="danger" size="sm" onClick={() => setConfirmClose(true)}>
            Close Ticket
          </Button>
        )}
      </div>

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
        <p className="text-sm text-slate-300 leading-relaxed">{ticket.description}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500">
          <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
          {ticket.assignedTo && <span>Assigned to you</span>}
        </div>
      </Card>

      {/* Messages */}
      <Card>
        <h2 className="text-base font-semibold text-slate-200 mb-6">Conversation</h2>
        <MessageThread messages={messages} currentUserId={profileId ?? undefined} />
      </Card>

      {/* Reply */}
      {!isClosed ? (
        <Card>
          <h3 className="text-sm font-medium text-slate-300 mb-4">Reply to User</h3>
          <MessageInput onSend={handleSend} placeholder="Type your response to the user…" />
        </Card>
      ) : (
        <div className="text-center py-6 text-slate-500 text-sm bg-slate-800/40 border border-slate-700/40 rounded-xl">
          This ticket is {ticket.status.toLowerCase()}.
        </div>
      )}

      {/* Close confirmation */}
      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Close Ticket"
        maxWidth="sm"
      >
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to close this ticket? The user will be notified and will no longer be able to reply.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmClose(false)}>Cancel</Button>
          <Button variant="danger" loading={closing} onClick={handleClose}>
            Close Ticket
          </Button>
        </div>
      </Modal>
    </div>
  );
}
