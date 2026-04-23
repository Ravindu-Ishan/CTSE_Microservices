import Link from 'next/link';
import type { Ticket } from '@/lib/types/ticket';
import { TicketStatusBadge, PriorityBadge, CategoryBadge } from '@/components/ui/Badge';

interface TicketCardProps {
  ticket: Ticket;
  href: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TicketCard({ ticket, href }: TicketCardProps) {
  return (
    <Link
      href={href}
      className="block bg-slate-800 border border-slate-700 hover:border-blue-500/40 rounded-xl p-5 transition-all hover:bg-slate-800/80 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2 flex-1">
          {ticket.title}
        </h3>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{ticket.description}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <CategoryBadge category={ticket.category} />
        <PriorityBadge priority={ticket.priority} />
        <span className="ml-auto">{timeAgo(ticket.createdAt)}</span>
      </div>
    </Link>
  );
}
