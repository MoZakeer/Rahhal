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

  useEffect(() => {
    if (!user?.token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/presenceHub`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        setPresenceConnection(connection);
      })
      .catch(console.error);

    return () => {
      connection.stop();
    };
  }, [user?.token]);

  return (
    <RealtimeContext.Provider value={{ presenceConnection }}>
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
