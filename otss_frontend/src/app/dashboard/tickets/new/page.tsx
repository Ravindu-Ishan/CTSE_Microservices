'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTicket } from '@/lib/api/ticket';
import TicketForm from '@/components/tickets/TicketForm';
import type { CreateTicketDto } from '@/lib/types/ticket';
import Button from '@/components/ui/Button';
import { useAppSession } from '@/components/AppSessionContext';

export default function NewTicketPage() {
  const { profileId, accessToken } = useAppSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: Omit<CreateTicketDto, 'createdBy'>) => {
    if (!profileId) return;
    setLoading(true);
    setError('');
    try {
      const ticket = await createTicket({ ...data, createdBy: profileId }, accessToken ?? undefined);
      router.push(`/dashboard/tickets/${ticket.id}`);
    } catch {
      setError('Failed to create ticket. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard/tickets">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Open a Ticket</h1>
          <p className="text-slate-400 text-sm mt-0.5">Describe your issue and we&apos;ll get back to you.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-400/10 border border-red-400/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8">
        <TicketForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
