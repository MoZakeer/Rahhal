/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../utils/constant";
import { useUser } from "./UserContext";

type RealtimeContextType = {
  presenceConnection: signalR.HubConnection | null;
  notificationConnection: signalR.HubConnection | null;
  chatConnection: signalR.HubConnection | null;
};

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  const [presenceConnection, setPresenceConnection] =
    useState<signalR.HubConnection | null>(null);

  const [notificationConnection, setNotificationConnection] =
    useState<signalR.HubConnection | null>(null);

  const [chatConnection, setChatConnection] =
    useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!user?.token) return;

    let isMounted = true;

    // 🔥 helper: start with retry
    const startConnection = async (conn: signalR.HubConnection) => {
      try {
        if (conn.state === "Disconnected") {
          await conn.start();
          console.log(`${conn.baseUrl} connected`);
        }
      } catch (err) {
        console.error("SignalR retry...", err);
        setTimeout(() => startConnection(conn), 2000);
      }
    };

    // 🔥 create connections
    const presence = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/presenceHub`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    const notification = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/Notification`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    const chat = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/ChatHub`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    // 🔥 optional: debug logs
    presence.onreconnected(() => console.log("Presence reconnected"));
    notification.onreconnected(() =>
      console.log("Notification reconnected"),
    );
    chat.onreconnected(() => console.log("Chat reconnected"));

    const startConnections = async () => {
      // ⚠️ sequential start (مش Promise.all)
      await startConnection(presence);
      await startConnection(notification);
      await startConnection(chat);

      if (!isMounted) return;

      setPresenceConnection(presence);
      setNotificationConnection(notification);
      setChatConnection(chat);
    };

    startConnections();

    // 🔥 cleanup safe
    return () => {
      isMounted = false;

      const stopConnection = async (conn: signalR.HubConnection) => {
        try {
          if (conn.state === "Connected") {
            await conn.stop();
          }
        } catch (err) {
          console.error("Error stopping connection:", err);
        }
      };

      stopConnection(presence);
      stopConnection(notification);
      stopConnection(chat);
    };
  }, [user?.token]);

  return (
    <RealtimeContext.Provider
      value={{
        presenceConnection,
        notificationConnection,
        chatConnection,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }

  return context;
};