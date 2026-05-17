/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { type ChatType } from "../types/chatType";
import { useRealtime } from "@/context/RealtimeContext";

export type UpdateSidebarData = {
  conversationId: string;
  lastMessageContent: string;
  lastMessageDate: string;
  lastMessageSender: string;
  isLastMessageFullySeen: boolean;
  unreadCount: number;
  messageType: number;
};
type TypingSidebarData = {
  conversationId: string;
  userName: string;
  isTyping: boolean;
};
export const useSidebarUpdates = function () {
  const queryClient = useQueryClient();
  const { chatConnection: connection } = useRealtime();
  const { conversationId: activeChatId } = useParams<{
    conversationId: string;
  }>();

  useEffect(() => {
    if (!connection) return;

    const handleUpdateSidebar = function (data: UpdateSidebarData) {
      console.log(data);
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
              lastMessageSender: data.lastMessageSender,
            };

            chats.splice(index, 1);
            chats.unshift(updatedChat);
          }
          return { ...oldData, data: chats };
        },
      );
    };

    const handleUpdateUnreadCount = function (data: {
      conversationId: string;
      unreadCount: number;
    }) {
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
    const handleLastMessageSeen = function (data: UpdateSidebarData) {
      console.log(data);
    };
    const handleDeleteSidebarMessage = function (data: UpdateSidebarData) {
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
              lastMessageSender: data.lastMessageSender,
            };

            chats[index] = updatedChat;
          }
          return { ...oldData, data: chats };
        },
      );
    };

    const handleSidebarTyping = (data: TypingSidebarData) => {
      queryClient.setQueryData<{ data: ChatType[] }>(
        ["all-chats"],
        (oldData) => {
          if (!oldData?.data) return oldData;

          const updatedChats = oldData.data.map((chat) => {
            if (chat.conversationId !== data.conversationId) {
              return chat;
            }

            return {
              ...chat,

              isTyping: data.isTyping,

              typingUserName: data.isTyping ? data.userName : undefined,
            };
          });

          return {
            ...oldData,
            data: updatedChats,
          };
        },
      );
    };
    connection.on("UpdateSidebar", handleUpdateSidebar);
    connection.on("UpdateUnreadCount", handleUpdateUnreadCount);
    connection.on("NewChatCreated", handleNewChat);
    connection.on("UpdateSeenMark", handleLastMessageSeen);
    connection.on("DeleteLastMessage", handleDeleteSidebarMessage);
    connection.on("UserTyping", handleSidebarTyping);
    return () => {
      connection.off("UpdateSidebar", handleUpdateSidebar);
      connection.off("UpdateUnreadCount", handleUpdateUnreadCount);
      connection.off("NewChatCreated", handleNewChat);
      connection.off("UpdateSeenMark", handleLastMessageSeen);
      connection.off("DeleteLastMessage", handleDeleteSidebarMessage);
      connection.off("UserTyping", handleSidebarTyping);
    };
  }, [connection, queryClient, activeChatId]);
};
