import { notificationClient, authHeader } from './client';
import type { NotificationLog, NotificationListParams } from '../types/notification';

export async function getNotificationsByUser(userId: string, params?: NotificationListParams, token?: string): Promise<NotificationLog[]> {
  const res = await notificationClient.get<NotificationLog[]>(`/notifications/user/${userId}`, { params, headers: authHeader(token) });
  return res.data;
}

export async function getNotificationsByTicket(ticketId: string, params?: NotificationListParams, token?: string): Promise<NotificationLog[]> {
  const res = await notificationClient.get<NotificationLog[]>(`/notifications/ticket/${ticketId}`, { params, headers: authHeader(token) });
  return res.data;
}
