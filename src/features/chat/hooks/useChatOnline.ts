/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRealtime } from "@/context/RealtimeContext";
import { useEffect } from "react";

export function useChatOnline(
  id: string | null,
  setIsOnline: (value: boolean) => void,
) {
  const { presenceConnection } = useRealtime();

  useEffect(() => {
    if (!presenceConnection || !id) return;
    presenceConnection.invoke("SubscribeToStatuses", [id]);

    const handler = (data: any) => {
      if (!data || !data.profileId) return;

      if (String(data.profileId) !== String(id)) return;

      setIsOnline(Boolean(data.isOnline));
    };

    presenceConnection.on("UserStatusChanged", handler);

    return () => {
      presenceConnection.off("UserStatusChanged", handler);
      // presenceConnection.invoke("UnsubscribeFromStatuses", [id]);
    };
  }, [presenceConnection, id, setIsOnline]);
}
