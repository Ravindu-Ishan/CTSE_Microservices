export type NotificationType = 'TICKET_CREATED' | 'TICKET_REPLY' | 'TICKET_CLOSED';
export type NotificationStatus = 'SENT' | 'FAILED';

export interface NotificationLog {
  id: string;
  ticketId: string;
  recipientEmail: string;
  recipientUserId: string;
  type: NotificationType;
  status: NotificationStatus;
  subject: string;
  errorMessage: string | null;
  sentAt: string;
}

export interface NotificationListParams {
  type?: NotificationType;
  status?: NotificationStatus;
}
