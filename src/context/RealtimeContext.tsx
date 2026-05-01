/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

const RealtimeContext = createContext<any>(null);

export const RealtimeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();

  const [presenceConnection, setPresenceConnection] =
    useState<signalR.HubConnection | null>(null);

  const [notificationConnection, setNotificationConnection] =
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
      .withUrl(`${BASE_URL}/Realtime/notificationHub`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    const startConnections = async () => {
      try {
        await presence.start();
        await notification.start();

        setPresenceConnection(presence);
        setNotificationConnection(notification);
      } catch (error) {
        console.error("SignalR Error:", error);
      }
    };

    startConnections();

    return () => {
      presence.stop();
      notification.stop();
    };
  }, [user?.token]);

  return (
    <RealtimeContext.Provider
      value={{
        presenceConnection,
        notificationConnection,
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
