export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'IT' | 'BILLING' | 'ACCESS' | 'OTHER';
export type MessageAuthorRole = 'END_USER' | 'STAFF';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  authorId: string;
  authorRole: MessageAuthorRole;
  createdAt: string;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  createdBy: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: string;
}

export interface CreateMessageDto {
  content: string;
  authorId: string;
  authorRole: MessageAuthorRole;
}

export interface TicketListParams {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  createdBy?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}
