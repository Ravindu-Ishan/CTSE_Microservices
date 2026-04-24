import { ticketClient, authHeader } from './client';
import type {
  Ticket, TicketMessage, CreateTicketDto, UpdateTicketDto,
  CreateMessageDto, TicketListParams,
} from '../types/ticket';

export async function createTicket(data: CreateTicketDto, token?: string): Promise<Ticket> {
  const res = await ticketClient.post<Ticket>('/tickets', data, { headers: authHeader(token) });
  return res.data;
}

interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  limit: number;
  offset: number;
}

export async function listTickets(params?: TicketListParams, token?: string): Promise<Ticket[]> {
  const res = await ticketClient.get<TicketListResponse>('/tickets', { params, headers: authHeader(token) });
  return res.data.tickets ?? [];
}

export async function getTicket(id: string, token?: string): Promise<Ticket> {
  const res = await ticketClient.get<Ticket>(`/tickets/${id}`, { headers: authHeader(token) });
  return res.data;
}

export async function updateTicket(id: string, data: UpdateTicketDto, token?: string): Promise<Ticket> {
  const res = await ticketClient.patch<Ticket>(`/tickets/${id}`, data, { headers: authHeader(token) });
  return res.data;
}

export async function closeTicket(id: string, token?: string): Promise<Ticket> {
  const res = await ticketClient.patch<Ticket>(`/tickets/${id}/close`, {}, { headers: authHeader(token) });
  return res.data;
}

export async function addMessage(ticketId: string, data: CreateMessageDto, token?: string): Promise<TicketMessage> {
  const res = await ticketClient.post<TicketMessage>(`/tickets/${ticketId}/messages`, data, { headers: authHeader(token) });
  return res.data;
}

export async function getMessages(ticketId: string, token?: string): Promise<TicketMessage[]> {
  const res = await ticketClient.get<TicketMessage[]>(`/tickets/${ticketId}/messages`, { headers: authHeader(token) });
  return res.data;
}
