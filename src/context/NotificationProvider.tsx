import { createContext, useContext } from "react";
import { useNotifications } from "../features/Notifications/hooks/useNotifications";

type Props = {
  children: React.ReactNode;
};

export const NotificationContext = createContext<any>(null);

export function NotificationProvider({ children }: Props) {
  const { unreadCount, markAllAsRead, notifications } =
    useNotifications(true);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        markAllAsRead,
        notifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
export const useNotificationContext = () => {
  return useContext(NotificationContext);
};