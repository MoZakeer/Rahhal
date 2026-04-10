import { useEffect, useState } from "react";
import { FaHeart, FaUserPlus, FaComment, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "like" | "follow" | "message";
  isRead: boolean;
  createdAt: string;
}

const API_URL = "https://rahhal-api.runasp.net/Notifiaction/GetAll";
const READ_URL = "https://rahhal-api.runasp.net/Notification/Read";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const mapped: Notification[] = data.data.items.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        type: n.title.toLowerCase().includes("like")
          ? "like"
          : n.title.toLowerCase().includes("follower")
          ? "follow"
          : "message",
      }));

      mapped.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setNotifications(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔹 لما أضغط على نوتيفيكيشن
  const handleClick = async (id: string, url: string = "/notifications") => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await fetch(READ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error(err);
    }

    navigate(url);
  };


  const handleBack = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }

    navigate(-1);
  };

  const formatTime = (dateString: string) => {
    const created = new Date(dateString);
    return created.toLocaleString();
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

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{
        background: `linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100), var(--color-primary-200))`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 font-semibold"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-4xl font-bold mb-8">Notifications</h1>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-gray-200 animate-pulse h-16"
              />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <p className="text-center">No notifications</p>
        )}

        <div className="grid gap-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id)}
              className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition
                ${
                  !n.isRead
                    ? "bg-blue-50 border-blue-400 shadow-sm"
                    : "bg-white border-gray-200"
                }`}
            >
              <div className="text-xl">{getIcon(n.type)}</div>

              <div className="flex-1">
             
                <p className="font-semibold flex items-center gap-2">
                  {n.title}

                </p>

                <p className="text-sm text-gray-500">{n.message}</p>

                <span className="text-xs text-gray-400">
                  {formatTime(n.createdAt)}
                </span>
              </div>

              
              {!n.isRead && (
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}