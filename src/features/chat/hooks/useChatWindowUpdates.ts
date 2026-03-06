import { useEffect } from "react";
import { HubConnection } from "@microsoft/signalr";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { ChatResponse } from "../types/chat.types";
import type { Message } from "../types/message.types";

export const useChatWindowUpdates = (
  connection: HubConnection | null,
  conversationId: string | undefined,
  userId: string | undefined,
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!connection || !conversationId) return;

    // 1. الانضمام للمحادثة لإرسال/استقبال الأحداث في الوقت الفعلي
    connection.invoke("JoinConversation", conversationId).catch(console.error);

    // 2. إبلاغ الباك إند فور فتح الشات بأنني قرأت الرسائل الحالية
    if (userId) {
      connection
        .invoke("MarkAsRead", {
          ConversationId: conversationId,
          ProfileId: userId,
        })
        .then(() => console.log("✅ DB notified: Conversation marked as read"))
        .catch((err) => console.error("❌ Failed to notify DB:", err));
    }

    // --- Handlers ---

    // التعامل مع استقبال رسالة جديدة
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

      // إذا كنت أنا المستقبل (ولست الراسل)، أبلغ الباك إند فوراً أنني قرأت الرسالة الجديدة
      if (userId && newMessage.senderProfileId !== userId) {
        connection
          .invoke("MarkAsRead", {
            ConversationId: conversationId,
            ProfileId: userId,
          })
          .catch(() => {});
      }
    };

    // التعامل مع إشعار "الطرف الآخر قرأ رسائلي"
    const handleMessageSeen = (data: {
      conversationId: string;
      messageId: string;
    }) => {
      // التأكد أن الإشعار يخص المحادثة المفتوحة حالياً
      if (data.conversationId !== conversationId) return;

      queryClient.setQueryData<InfiniteData<ChatResponse>>(
        ["chat", conversationId],
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                messages: {
                  ...page.data.messages,
                  items: page.data.messages.items.map((msg: Message) => {
                    // إذا كانت الرسالة من إرسالي ولم تُقرأ بعد، نحولها لـ Seen
                    // (المنطق: طالما آخر رسالة قرأت، فكل ما قبلها قرأ أيضاً)
                    if (msg.senderProfileId === userId && !msg.isSeen) {
                      return { ...msg, isSeen: true };
                    }
                    return msg;
                  }),
                },
              },
            })),
          };
        },
      );
    };

    // --- Listeners Registration ---
    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("MessageFullySeen", handleMessageSeen);

    return () => {
      // Clean up
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("MessageFullySeen", handleMessageSeen);
      connection.invoke("LeaveConversation", conversationId).catch(() => {});
    };
  }, [connection, conversationId, userId, queryClient]);
};
