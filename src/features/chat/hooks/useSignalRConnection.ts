import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "../../../utils/constant";
import { useUser } from "../../../context/UserContext";

export const useSignalRConnection = (url: string) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const { user } = useUser();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!user?.token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}${url}`, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        if (isMounted.current) {
          setConnection(newConnection);
        } else {
          newConnection.stop();
        }
      })
      .catch((err) => {
        if (err.message && err.message.includes("stopped during negotiation")) {
          console.warn(
            "SignalR connection aborted due to component unmount (Normal in Strict Mode).",
          );
        } else {
          console.error("SignalR Connection Error: ", err);
        }
      });

    return () => {
      isMounted.current = false;
      newConnection.stop().catch(() => {});
    };
  }, [user?.token, url]);

  return connection;
};
