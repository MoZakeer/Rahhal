import { useUser } from "@/context/UserContext";
import type { NotificationData } from "./useNotifications";

export function useUpdateNotification(
  setNotifications: (value: NotificationData) => void,
) {
  const {
    user: { userId },
  } = useUser();
}
