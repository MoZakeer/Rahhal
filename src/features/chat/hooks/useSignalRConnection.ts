import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../../utils/constant";
import { useUser } from "../../../context/UserContext";

export const useSignalRConnection = (url:string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const { user } = useUser();

  useEffect(() => {
    if (!user?.token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}${url}`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      setConnection(newConnection);
    });

    return () => {
      newConnection.stop();
    };
  }, [user?.token]);
  return connection;
};
