import type { TicketStatus, TicketPriority, TicketCategory } from '@/lib/types/ticket';
import type { QueueEntryStatus } from '@/lib/types/queue';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-300/10 text-green-300 border-green-300/30',
  warning: 'bg-yellow-300/10 text-yellow-300 border-yellow-300/30',
  danger: 'bg-red-300/10 text-red-300 border-red-300/30',
  info: 'bg-blue-300/10 text-blue-300 border-blue-300/30',
  neutral: 'bg-slate-600/30 text-slate-400 border-slate-600/40',
};

export default function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { variant: BadgeVariant; label: string }> = {
    OPEN: { variant: 'info', label: 'Open' },
    IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
    RESOLVED: { variant: 'success', label: 'Resolved' },
    CLOSED: { variant: 'danger', label: 'Closed' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const map: Record<TicketPriority, { variant: BadgeVariant; label: string }> = {
    LOW: { variant: 'neutral', label: 'Low' },
    MEDIUM: { variant: 'warning', label: 'Medium' },
    HIGH: { variant: 'danger', label: 'High' },
    URGENT: { variant: 'danger', label: 'Urgent' },
  };
  const { variant, label } = map[priority];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CategoryBadge({ category }: { category: TicketCategory }) {
  const labels: Record<TicketCategory, string> = {
    IT: 'IT',
    BILLING: 'Billing',
    ACCESS: 'Access',
    OTHER: 'Other',
  };
  return <Badge variant="info">{labels[category]}</Badge>;
}

export function QueueStatusBadge({ status }: { status: QueueEntryStatus }) {
  const map: Record<QueueEntryStatus, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'warning', label: 'Pending' },
    ASSIGNED: { variant: 'info', label: 'Assigned' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    FAILED: { variant: 'danger', label: 'Failed' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
