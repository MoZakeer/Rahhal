import { useEffect, useState } from "react";
import {
  FaHeart,
  FaUserPlus,
  FaComment,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "like" | "follow" | "message";
  isRead: boolean;
  createdAt: string;
}

const API_URL =
  "https://rahhal-api.runasp.net/Notifiaction/GetAll?SortByLastAdded=true&PageNumber=";

const READ_URL = "https://rahhal-api.runasp.net/Notification/Read";

const getNotificationType = (
  title: string
): "like" | "follow" | "message" => {
  const t = title.toLowerCase();

  if (t.includes("like")) return "like";
  if (t.includes("follow") || t.includes("follower")) return "follow";
  return "message";
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchNotifications = async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`${API_URL}${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      const items: Notification[] = (data?.data?.items ?? []).map(
        (n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
          type: getNotificationType(n.title),
        })
      );

      const pages = data?.data?.pages ?? 1;

      setHasMore(page < pages);

      setNotifications((prev) => {
        const merged = append ? [...prev, ...items] : items;

        return Array.from(
          new Map(merged.map((n) => [n.id, n])).values()
        );
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, false);
  }, []);

  // 🔥 Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 100) {
        const next = pageNumber + 1;
        setPageNumber(next);
        fetchNotifications(next, true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageNumber, hasMore, loadingMore]);

  const handleClick = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );

    await fetch(READ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notificationId: id }),
    });
  };

  const handleBack = async () => {
    await fetch(READ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );

    navigate(-1);
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <FaHeart className="text-red-500" />;
      case "follow":
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaComment className="text-blue-500" />;
    }
  };

  // 🔥 Skeleton component
  const SkeletonItem = () => (
    <div className="flex gap-4 p-5 rounded-xl bg-gray-200 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-gray-300" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-gray-300 rounded" />
        <div className="h-3 w-2/3 bg-gray-300 rounded" />
        <div className="h-3 w-1/4 bg-gray-300 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50" style={{
        background: `linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100), var(--color-primary-200))`,
      }}>
      
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 font-semibold"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-4xl font-bold mb-8">
          Notifications
        </h1>

        {/* 🔥 initial skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}

        {/* data */}
        <div className="grid gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id)}
              className={`flex gap-4 p-5 rounded-xl cursor-pointer border transition
                ${
                  !n.isRead
                    ? "bg-blue-50 border-blue-400"
                    : "bg-white border-gray-200"
                }`}
            >
              <div className="text-xl">
                {getIcon(n.type)}
              </div>

              <div className="flex-1">
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-500">
                  {n.message}
                </p>

                <span className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {!n.isRead && (
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
              )}
            </div>
          ))}

          {/* 🔥 skeleton on scroll load */}
          {loadingMore && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonItem key={i} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}