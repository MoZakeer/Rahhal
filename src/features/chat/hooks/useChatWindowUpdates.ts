import { useEffect } from "react";
import { HubConnection } from "@microsoft/signalr";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { ChatResponse } from "../types/chat.types";
import type { Message } from "../types/message.types";

export const useChatWindowUpdates = (
  connection: HubConnection | null,
  conversationId: string | undefined,
  userId: string | undefined, // أضفنا الـ userId هنا لإبلاغ الـ DB
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!connection || !conversationId) return;

    // 1. الدخول لغرفة المحادثة لاستقبال الرسائل
    connection.invoke("JoinConversation", conversationId).catch(console.error);

    // 2. 🔥 التبليغ بفتح الشات لتصفير العداد في الـ DB
    if (userId) {
      connection.invoke("MarkAsRead", {
        ConversationId: conversationId,
        ProfileId: userId,
      })
      .then(() => console.log("✅ DB notified: Conversation marked as read"))
      .catch((err) => console.error("❌ Failed to notify DB:", err));
    }

    const handleReceiveMessage = (newMessage: Message) => {
      queryClient.setQueryData<InfiniteData<ChatResponse>>(
        ["chat", conversationId],
        (oldData) => {
          if (!oldData || oldData.pages.length === 0) return oldData;

          const isDuplicate = oldData.pages.some((page) =>
            page.data.messages.items.some(
              (msg: Message) => msg.messageId === newMessage.messageId,
            ),
          );

          if (isDuplicate) return oldData;

          const newPages = [...oldData.pages];

          newPages[0] = {
            ...newPages[0],
            data: {
              ...newPages[0].data,
              messages: {
                ...newPages[0].data.messages,
                items: [...newPages[0].data.messages.items, newMessage],
              },
            },
          };

          return { ...oldData, pages: newPages };
        },
      );

      // 3. 🔥 إذا وصلت رسالة جديدة وأنت "فاتح الشات"، بلغ الـ DB فوراً لتظل مقروءة
      if (userId && newMessage.senderProfileId !== userId) {
        connection.invoke("MarkAsRead", {
          ConversationId: conversationId,
          ProfileId: userId,
        }).catch(() => {});
      }
    };

    connection.on("ReceiveMessage", handleReceiveMessage);

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.invoke("LeaveConversation", conversationId).catch(() => {});
    };
    // أضفنا userId و conversationId هنا لضمان إعادة التنفيذ عند تغيير المحادثة
  }, [connection, conversationId, userId, queryClient]); 
};