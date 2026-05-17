import { useRealtime } from "@/context/RealtimeContext";
import { useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router";

export function useTyping() {
  const { chatConnection: connection } = useRealtime();

  const { conversationId } = useParams<{ conversationId: string }>();

  const isTypingRef = useRef(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(async () => {
    if (!conversationId || !connection) return;

    // if (isTypingRef.current) return;

    isTypingRef.current = true;

    await connection.invoke("SendTypingStatus", conversationId, true);
  }, [conversationId, connection]);

  const stopTyping = useCallback(async () => {
    if (!conversationId || !connection) return;

    if (!isTypingRef.current) return;

    isTypingRef.current = false;

    await connection.invoke("SendTypingStatus", conversationId, false);
  }, [conversationId, connection]);

  const handleTyping = useCallback(async () => {
    await startTyping();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [startTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      stopTyping();
    };
  }, [stopTyping]);

  return {
    handleTyping,
    stopTyping,
  };
}
