import { TicketCategory, TicketPriority } from './ticket';

export type QueueEntryStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'FAILED';

export interface QueueEntry {
  id: string;
  ticketId: string;
  ticketPriority: TicketPriority;
  ticketCategory: TicketCategory;
  createdBy: string;
  assignedStaffId: string | null;
  status: QueueEntryStatus;
  assignedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  pending: number;
  assigned: number;
  failed: number;
  completed: number;
  total: number;
}

export interface QueueListParams {
  status?: QueueEntryStatus;
  ticketPriority?: TicketPriority;
  ticketCategory?: TicketCategory;
  assignedStaffId?: string;
  limit?: number;
  offset?: number;
}

export interface QueueListResponse {
  entries: QueueEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface ManualAssignDto {
  staffId: string;
}
