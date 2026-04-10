import { useState, useEffect } from 'react';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const API_BASE_URL = "https://rahhal-api.runasp.net";

export const useNotifications = (hasToken: boolean) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!hasToken) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Notifiaction/GetAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const result = await res.json();

        if (result && result.data && Array.isArray(result.data.items)) {
          setNotifications(result.data.items);
          const unread = result.data.items.filter((n: NotificationData) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Notifications fetch error:", error);
      }
    };

    fetchNotifications();
  }, [hasToken]);

  const markAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/Notification/Read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const result = await res.json();

      if (result?.isSuccess) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Mark notifications as read error:", error);
    }
  };

  return { notifications, unreadCount, markAsRead };
};