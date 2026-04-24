import axios from 'axios';

function makeClient(baseURL: string) {
  return axios.create({ baseURL, timeout: 10000 });
}

export const userClient = makeClient(
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? 'http://localhost:3010'
);
export const ticketClient = makeClient(
  process.env.NEXT_PUBLIC_TICKET_SERVICE_URL ?? 'http://localhost:3030'
);
export const queueClient = makeClient(
  process.env.NEXT_PUBLIC_QUEUE_SERVICE_URL ?? 'http://localhost:3040'
);
export const notificationClient = makeClient(
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL ?? 'http://localhost:3050'
);

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
