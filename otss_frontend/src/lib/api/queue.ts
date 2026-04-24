import { queueClient, authHeader } from './client';
import type { QueueEntry, QueueStats, QueueListParams, QueueListResponse, ManualAssignDto } from '../types/queue';

export async function listQueue(params?: QueueListParams, token?: string): Promise<QueueListResponse> {
  const res = await queueClient.get<QueueListResponse>('/queue', { params, headers: authHeader(token) });
  return res.data;
}

export async function getQueueStats(token?: string): Promise<QueueStats> {
  const res = await queueClient.get<QueueStats>('/queue/stats', { headers: authHeader(token) });
  return res.data;
}

export async function getQueueEntry(ticketId: string, token?: string): Promise<QueueEntry> {
  const res = await queueClient.get<QueueEntry>(`/queue/${ticketId}`, { headers: authHeader(token) });
  return res.data;
}

export async function manualAssign(ticketId: string, data: ManualAssignDto, token?: string): Promise<void> {
  await queueClient.post(`/queue/${ticketId}/assign`, data, { headers: authHeader(token) });
}
