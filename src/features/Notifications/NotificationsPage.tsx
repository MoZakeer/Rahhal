import { useEffect, useState } from "react";
import { FaHeart, FaUserPlus, FaComment, FaTimes } from "react-icons/fa";
import { useNotifications } from "./hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";

const getNotificationType = (title: string): "like" | "follow" | "message" => {
  const t = title.toLowerCase();

  if (t.includes("like")) return "like";
  if (t.includes("follow") || t.includes("follower")) return "follow";
  return "message";
};

export function useNow(interval = 60000) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return now;
}

export function formatTimeAgo(dateString: string, now: number) {
  const date = new Date(dateString);

  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "yesterday";

  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const now = useNow();

  const {
    notifications,
    loading,
    loadingMore,
    loadMore,
    hasMore,
    markAsDelivered,
    markAllAsRead,
    markAllAsDelivered,
    deleteNotification,
  } = useNotifications(true);

  const isEmpty = !loading && notifications.length === 0;

  useEffect(() => {
    if (!notifications.length) return;
    markAllAsRead();
  }, [notifications.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= docHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, loadMore]);

  const handleClick = async (id: string) => {
    await markAsDelivered(id);
  };

  const getIcon = (type: "like" | "follow" | "message") => {
    switch (type) {
      case "like":
        return <FaHeart className="text-red-500" />;
      case "follow":
        return <FaUserPlus className="text-green-500" />;
      default:
        return <FaComment className="text-blue-500" />;
    }
  };

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
    <div
      className="min-h-screen px-6 py-10 pt-24"
      style={{
        background: `linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100), var(--color-primary-200))`,
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Notifications</h1>

          {!isEmpty && (
            <button
              onClick={markAllAsDelivered}
              className="text-m text-gray-600 hover:text-gray-800 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-700">
              No notifications yet
            </h2>
            <p className="text-gray-500 mt-2">
              You will see updates here when something happens
            </p>
          </div>
        )}

        {/* LOADING */}
        {loading && notifications.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}

        {/* LIST */}
        {!isEmpty && (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-4">
              {notifications.map((n) => (
                <motion.div
                  key={`${n.id}-${n.createdAt}`}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 100, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => handleClick(n.id)}
                  className={`relative flex gap-4 p-5 rounded-xl cursor-pointer border transition
                  ${
                    !n.isDelivered
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="text-xl">
                    {getIcon(getNotificationType(n.title))}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-gray-500">{n.message}</p>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(n.createdAt, now)}
                    </span>

                    {!n.isDelivered && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* LOADING MORE */}
        {loadingMore && (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}