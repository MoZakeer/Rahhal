import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../../utils/constant";
import { useUser } from "../../../context/UserContext";

export const useSignalRNotificationConnection = () => {
  const [connection, setConnection] =
    useState<signalR.HubConnection | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (!user?.token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/Realtime/Notification`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await newConnection.start();

        setConnection(newConnection);
      } catch (err) {
        // console.error("SignalR error:", err);
        setTimeout(startConnection, 3000);
      }
    };

    startConnection();

    return () => {
      newConnection.stop();
    };
  }, [user?.token]);

  return connection;
};