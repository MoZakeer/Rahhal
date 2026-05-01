import { useEffect, useState, useCallback } from "react";
import { useSignalRNotificationConnection } from "./useSignalRNotificationConnection";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

const API_BASE_URL = "https://rahhal-api.runasp.net";

export const useNotifications = (hasToken: boolean) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  
  const [unreadCount, setUnreadCount] = useState(0);

  const [pageIndex, setPageIndex] = useState(1);
  const [pages, setPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const token = localStorage.getItem("token");
  const connection = useSignalRNotificationConnection();

  const location = useLocation();
  const isOnNotificationsPage = location.pathname.startsWith("/notifications");

  // FETCH NOTIFICATIONS
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!hasToken || !token) return;

      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

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

        setNotifications((prev) => {
          const merged = append ? [...prev, ...items] : items;

          return Array.from(
            new Map(merged.map((n) => [n.id, n])).values()
          );
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [hasToken, token]
  );

  // FETCH UNREAD COUNT
  const fetchUnreadCount = useCallback(async () => {
    if (!hasToken || !token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/Notification/UnreadCount`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      const result = await res.json();
      const count = result?.data?.unreadCount ?? 0;

      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  }, [hasToken, token]);

  // INITIAL LOAD
  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // RESET COUNT ON PAGE OPEN
  useEffect(() => {
    if (isOnNotificationsPage) {
      setUnreadCount(0);
    }
  }, [isOnNotificationsPage]);

  // MARK ALL AS READ ON PAGE OPEN
  useEffect(() => {
    if (isOnNotificationsPage) {
      markAllAsRead();
    }
  }, [isOnNotificationsPage]);

  // SIGNALR
  useEffect(() => {
    if (!connection) return;

    const handler = (notification: any) => {
      const newItem: NotificationData = {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        isRead: false,
        isDelivered: notification.isDelivered ?? false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        const merged = [newItem, ...prev];

        return Array.from(
          new Map(merged.map((n) => [n.id, n])).values()
        );
      });

      if (!isOnNotificationsPage) {
        setUnreadCount((prev) => prev + 1);
      }

      // TOAST
      if (!isOnNotificationsPage) {
  toast.custom(
    (t) => (
      <div
        onClick={() => {
          window.location.href = "/notifications";
          toast.dismiss(t.id);
        }}
        className={`transform transition-all duration-500 ${
          t.visible
            ? "translate-x-0 opacity-100"
            : "translate-x-20 opacity-0"
        }
        bg-white dark:bg-slate-800
        shadow-xl
        rounded-2xl p-4
        border border-gray-100 dark:border-slate-700
        cursor-pointer
        w-[90vw] sm:w-[360px]
        hover:scale-[1.02]`}
      >
        <div className="flex items-start gap-3">
          <div className="text-blue-500 text-xl">🔔</div>

          <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-slate-100">
              New Notification
            </p>
            <p className="text-gray-500 dark:text-slate-400 text-sm line-clamp-2">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
          Click to view
        </div>
      </div>
    ),
    { id: notification.id, duration: 4000 }
  );
}
    };

    connection.on("ReceiveNotification", handler);

    return () => {
      connection.off("ReceiveNotification", handler);
    };
  }, [connection, isOnNotificationsPage]);

  // LOAD MORE
  const loadMore = async () => {
    if (pageIndex >= pages || loadingMore) return;

    const next = pageIndex + 1;
    setPageIndex(next);

    await fetchNotifications(next, true);
  };

  // MARK ALL READ
  const markAllAsRead = async () => {
    if (!token) return;

    await fetch(`${API_BASE_URL}/Notification/Read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );

    setUnreadCount(0);
  };

  // MARK AS READ
  const markAsRead = async (id?: string) => {
    if (!token) return;

    await fetch(`${API_BASE_URL}/Notification/Read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id ? { notificationId: id } : {}),
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

    fetchUnreadCount();
  };

  // MARK AS DELIVERED
  const markAsDelivered = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/NotificationManagment/UpdateDelivery`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationId: id }),
        }
      );

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isDelivered: true } : n
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // MARK ALL AS DELIVERED
const markAllAsDelivered = async () => {
  if (!token) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/NotificationManagment/MakeAllAsDeliver`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!res.ok) return;

    // 👈 update UI
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isDelivered: true,
      }))
    );
  } catch (err) {
    console.error(err);
  }
};
  // DELETE
  const deleteNotification = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/NotificationManagment/Delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationId: id }),
        }
      );

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );

      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    loadMore,
    hasMore: pageIndex < pages,
    markAllAsRead,
    markAsRead,
    markAsDelivered,
    markAllAsDelivered,
    deleteNotification,
    refetch: () => {
      fetchNotifications(1, false);
      fetchUnreadCount();
    },
  };
};