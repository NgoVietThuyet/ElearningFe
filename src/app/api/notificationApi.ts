import apiClient from "./apiClient";

export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  relatedId?: number | null;
}

export const notificationApi = {
  getNotifications: (limit = 50) =>
    apiClient.get<NotificationDto[]>(`/api/notifications?limit=${limit}`),
  getUnreadCount: () =>
    apiClient.get<{ count: number }>("/api/notifications/unread-count"),
  markAllRead: () =>
    apiClient.post<{ success: boolean }>("/api/notifications/mark-all-read"),
  markRead: (id: number) =>
    apiClient.post<{ success: boolean }>(`/api/notifications/${id}/read`),
};
