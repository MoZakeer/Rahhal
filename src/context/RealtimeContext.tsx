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

    const startConnections = async () => {
      try {
        await Promise.all([
          presence.start(),
          notification.start(),
          chat.start(),
        ]);

        setPresenceConnection(presence);
        setNotificationConnection(notification);
        setChatConnection(chat);
      } catch (error) {
        console.error("SignalR Error:", error);
      }
    };

    startConnections();

    return () => {
      presence.stop();
      notification.stop();
      chat.stop();
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
