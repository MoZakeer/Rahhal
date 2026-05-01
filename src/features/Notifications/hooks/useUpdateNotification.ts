import { useRealtime } from "@/context/RealtimeContext";
import type { NotificationData } from "./useNotifications";
import { useEffect } from "react";

export function useUpdateNotification(
  setNotifications: React.Dispatch<React.SetStateAction<NotificationData[]>>,
) {
  const { notificationConnection } = useRealtime();

  useEffect(() => {
    if (!notificationConnection) return;

    const handler = (notification: NotificationData) => {
      console.log(notification);

      setNotifications((prev) => [notification, ...prev]);
    };

    notificationConnection.on("ReceiveNotification", handler);

    return () => {
      notificationConnection.off("ReceiveNotification", handler);
    };
  }, [notificationConnection, setNotifications]);
}
