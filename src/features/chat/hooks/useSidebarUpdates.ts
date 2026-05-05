/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useParams } from "react-router";
import { HubConnection } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatType } from "../../../types/ChatType";

export type UpdateSidebarData = {
  conversationId: string;
  lastMessageContent: string;
  lastMessageDate: string;
  unreadCount: number;
  messageType: number;
};
export const useSidebarUpdates = (connection: HubConnection | null) => {
  const queryClient = useQueryClient();

  const { conversationId: activeChatId } = useParams<{
    conversationId: string;
  }>();

  useEffect(() => {
    if (!connection) return;

    const handleUpdateSidebar = (data: UpdateSidebarData) => {
      queryClient.setQueryData<{ data: ChatType[] }>(
        ["all-chats"],
        (oldData) => {
          if (!oldData?.data) return oldData;

          const chats = [...oldData.data];
          const index = chats.findIndex(
            (c) => c.conversationId === data.conversationId,
          );

          if (index > -1) {
            const isChatOpenNow = data.conversationId === activeChatId;

            const updatedChat: ChatType = {
              ...chats[index],
              lastMessageContent: data.lastMessageContent,
              lastMessageDate: data.lastMessageDate,
              unreadMessagesCount: isChatOpenNow ? 0 : data.unreadCount,
              lastMessageType: data.messageType,
            };

            chats.splice(index, 1);
            chats.unshift(updatedChat);
          }
          return { ...oldData, data: chats };
        },
      );
    };

    const handleUpdateUnreadCount = (data: {
      conversationId: string;
      unreadCount: number;
    }) => {
      queryClient.setQueryData<{ data: ChatType[] }>(
        ["all-chats"],
        (oldData) => {
          if (!oldData?.data) return oldData;

          const chats = [...oldData.data];
          const index = chats.findIndex(
            (c) => c.conversationId === data.conversationId,
          );

          if (index > -1) {
            chats[index] = {
              ...chats[index],
              unreadMessagesCount: data.unreadCount,
            };
          }
          return { ...oldData, data: chats };
        },
      );
    };
    const handleNewChat = function (newChat: ChatType) {
      queryClient.setQueryData(["all-chats"], (oldData: any) => {
        if (!oldData) return oldData;

        const chats: ChatType[] = oldData.data ?? [];

        const filtered = chats.filter(
          (chat) => chat.conversationId !== newChat.conversationId,
        );

        return {
          ...oldData,
          data: [newChat, ...filtered],
        };
      });
    };
    connection.on("UpdateSidebar", handleUpdateSidebar);
    connection.on("UpdateUnreadCount", handleUpdateUnreadCount);
    connection.on("NewChatCreated", handleNewChat);
    return () => {
      connection.off("UpdateSidebar", handleUpdateSidebar);
      connection.off("UpdateUnreadCount", handleUpdateUnreadCount);
      connection.off("NewChatCreated", handleNewChat);
    };
  }, [connection, queryClient, activeChatId]);
};
