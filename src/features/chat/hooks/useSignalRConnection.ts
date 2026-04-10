import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../../utils/constant";
import { useUser } from "../../../context/UserContext";

export const useSignalRConnection = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.token) return;

    if (connectionRef.current) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/ChatHub`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = newConnection;

    let isMounted = true;

    const startConnection = async () => {
      try {
        await newConnection.start();
        if (!isMounted) return;

        setConnection(newConnection);
      } finally {
    // no catch → no logging
  }
    };

    startConnection();

    return () => {
      isMounted = false;

      if (
        newConnection.state === signalR.HubConnectionState.Connected
      ) {
        newConnection.stop();
      }

      connectionRef.current = null;
    };
  }, [user?.token]);

  return connection;
};