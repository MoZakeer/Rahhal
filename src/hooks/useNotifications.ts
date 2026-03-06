import { useState, useEffect } from 'react';

// import { io, Socket } from 'socket.io-client'; // Uncomment when integrating with backend

export interface NotificationData {
  id: string;
  title: string;
  timeAgo: string;
  isRead: boolean;
}

export const useNotifications = (hasToken: boolean) => {
  const [notifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!hasToken) return;

    /* ================== Testing Mode ================= */
    /*
    console.log("Testing Mode: Simulating Backend Notifications...");

    const testInterval = setInterval(() => {
      const newNotification: NotificationData = {
        id: Math.random().toString(36).substring(7), 
        title: "New amazing trip added just now!",
        timeAgo: "Just now",
        isRead: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
    }, 5000); 

    return () => {
      clearInterval(testInterval);
    };
    */
    
    /*
    const socket = io("http://localhost:5000", { auth: { token: "..." } });
    socket.on("new_notification", (data) => { ... });
    return () => socket.disconnect();
    */

  }, [hasToken]);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead };
};