import { useEffect, useState } from "react";
import { onNotificationMessage } from "../services/NotificationService";
import { Notification } from "../types/notification";

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = onNotificationMessage((payload) => {
      if (payload.data.userId === userId) {
        setNotifications((prev) => [
          {
            ...payload.data,
            id: payload.messageId,
            read: false,
          },
          ...prev,
        ]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  return {
    notifications,
    markAsRead,
  };
};
