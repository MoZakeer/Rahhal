import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNotifications } from "./hooks/useNotifications";
import type { NotificationData } from "./hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";
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

  const handleClick = (n: NotificationData) => {
    markAsDelivered(n.id);

    if (!n.typeId) return;

    const postTypes = ["AddPost", "AddLike", "Comment", "LikeToComment"];
    const tripTypes = ["RequestToTrip", "RespondToTrip"];

    if (postTypes.includes(n.notificationType)) {
      navigate(`/post/${n.typeId}`);
    } else if (n.notificationType === "MakeFollow") {
      navigate(`/profile/${n.typeId}`); 
    } else if (tripTypes.includes(n.notificationType)) {
      navigate(`/trip/${n.typeId}`); 
    }
  };



  const SkeletonItem = () => (
    <div className="flex gap-4 p-5 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse">
      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-slate-600" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 bg-gray-300 dark:bg-slate-600 rounded" />
        <div className="h-3 w-2/3 bg-gray-300 dark:bg-slate-600 rounded" />
        <div className="h-3 w-1/4 bg-gray-300 dark:bg-slate-600 rounded" />
      </div>
    </div>
  );

  return (
    <div
      className="
    min-h-screen px-6 py-10 pt-24
    bg-[linear-gradient(135deg,var(--color-primary-50),var(--color-primary-100),var(--color-primary-200))]
    dark:bg-none
    dark:bg-slate-900
    transition-colors duration-500
  "
    >
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
            Notifications
          </h1>

          {!isEmpty && (
            <button
              onClick={markAllAsDelivered}
              className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-slate-200">
              No notifications yet
            </h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">
              You will see updates here when something happens
            </p>
          </div>
        )}

        {loading && notifications.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        )}

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
                  onClick={() => handleClick(n)}
                  className={`relative flex gap-4 p-5 rounded-xl cursor-pointer border transition
                  ${!n.isDelivered
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-700"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                    }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700">
                    <img
                      src={
                        n.senderProfilePicture
                          ? `https://rahhal-api.runasp.net${n.senderProfilePicture}`
                          : DEFAULT_AVATAR
                      }
                      alt="user"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {n.message}
                    </p>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-slate-500 whitespace-nowrap">
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
                      className="text-gray-400 dark:text-slate-500 hover:text-red-500 transition"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

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