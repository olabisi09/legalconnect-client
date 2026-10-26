import { notificationAPI } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const NOTIFICATIONS_QUERY_KEY = "notifications";
export const useNotifications = (params?: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationAPI.getNotifications(params),
  });
};

export const useNotificationUnreadCount = () => {
  return useQuery({
    queryKey: ["unread-count"],

    queryFn: () => notificationAPI.getUnreadCount(),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });
};
