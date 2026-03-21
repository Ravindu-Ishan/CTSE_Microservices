export const KAFKA_TOPICS = {
  TICKET_CREATED: 'ticket.created',
  TICKET_UPDATED: 'ticket.updated',
  TICKET_CLOSED:  'ticket.closed',
} as const;

export const KAFKA_CONSUMER_GROUP = 'notification-service-group';
