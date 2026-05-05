import { useRealtime } from "@/context/RealtimeContext";
import { useEffect } from "react";

export function useChatOnline(
  id: string | null,
  setIsOnline: (value: boolean) => void,
) {
  const { presenceConnection } = useRealtime();

  useEffect(() => {
    if (!presenceConnection || !id) return;

    const handler = (data: { profileId: string; isOnline: boolean }) => {
      if (!data?.profileId) return;

      if (String(data.profileId) !== String(id)) return;

      setIsOnline(Boolean(data.isOnline));
    };

    // listen
    presenceConnection.on("UserStatusChanged", handler);

    // subscribe
    presenceConnection.invoke("SubscribeToStatuses", id);

    // 🔥 مهم جدًا
    presenceConnection.onreconnected(() => {
      presenceConnection.invoke("SubscribeToStatuses", id);
    });

    return () => {
      presenceConnection.off("UserStatusChanged", handler);
      presenceConnection.invoke("UnsubscribeFromStatus", id);
    };
  }, [presenceConnection, id, setIsOnline]);
}
