import { useRealtime } from "@/context/RealtimeContext";
import { useEffect } from "react";

export function useNavbar(
  setUnreadMessages: React.Dispatch<React.SetStateAction<number | undefined>>,
) {
  const { chatConnection } = useRealtime();
  useEffect(() => {
    if (!chatConnection) return;

    const handleUpdateUnread = (data: { totalUnreadCount: number }) => {
      setUnreadMessages(data.totalUnreadCount);
    };

    chatConnection.on("UpdateGlobalUnreadCount", handleUpdateUnread);

    return () => {
      chatConnection.off("UpdateGlobalUnreadCount", handleUpdateUnread);
    };
  }, [chatConnection, setUnreadMessages]);
}
