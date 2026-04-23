import type { HubConnection } from "@microsoft/signalr";
import { useEffect } from "react";

export function useChatOnline(
  connection: HubConnection | null,
  id: string | null,
  setIsOnline: (value: boolean) => void,
) {
  useEffect(() => {
    if (!connection || !id) return;

    connection
      .invoke("SubscribeToStatuses", [id])
      .catch((err) => console.error("Error subscribing to statuses: ", err));

    const handleStatusChange = (data: any) => {
      setIsOnline(data?.["isOnline"]);
    };

    connection.on("UserStatusChanged", handleStatusChange);

    return () => {
      connection.off("UserStatusChanged", handleStatusChange);
    };
  }, [connection, id, setIsOnline]);
}
