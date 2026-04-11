import { useEffect, useState, useCallback } from "react";

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

  const [pageIndex, setPageIndex] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!hasToken || !token) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/Notifiaction/GetAll?PageNumber=${page}&SortByLastAdded=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const result = await res.json();

        const items: NotificationData[] = result?.data?.items ?? [];
        const totalPages = result?.data?.pages ?? 1;

        setPages(totalPages);

        const merged = append
          ? [...notifications, ...items]
          : items;

        const unique = Array.from(
          new Map(merged.map((n) => [n.id, n])).values()
        );

        setNotifications(unique);

        // 🔥 FIX: unread count real-time
        const unread = unique.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [hasToken, token, notifications]
  );

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // 🔥 live refresh for bell only
  useEffect(() => {
    if (!hasToken) return;

    const interval = setInterval(() => {
      fetchNotifications(1, false);
    }, 15000); // كل 15 ثانية

    return () => clearInterval(interval);
  }, [hasToken, fetchNotifications]);

  const loadMore = () => {
    if (pageIndex >= pages) return;

    const next = pageIndex + 1;
    setPageIndex(next);

    fetchNotifications(next, true);
  };

  const markAsRead = async (id?: string) => {
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/Notification/Read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          id ? { notificationId: id } : {}
        ),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          id
            ? n.id === id
              ? { ...n, isRead: true }
              : n
            : { ...n, isRead: true }
        )
      );

      // 🔥 update instantly
      setUnreadCount((prev) =>
        id ? Math.max(prev - 1, 0) : 0
      );
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    loadMore,
    hasMore: pageIndex < pages,
    loading,
    refetch: () => fetchNotifications(1, false),
  };
};