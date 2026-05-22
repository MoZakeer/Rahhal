import { useEffect, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";

import type { ChatResponse } from "../types/chat.types";

import type { Message } from "../types/chat.types";

import { useRealtime } from "@/context/RealtimeContext";

export const useChatWindowUpdates = (
  conversationId: string | undefined,
  userId: string | undefined,

  setTypingUser: React.Dispatch<React.SetStateAction<string | null>>,

  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const queryClient = useQueryClient();

  const { chatConnection: connection } = useRealtime();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!connection || !conversationId) return;

    connection.invoke("JoinConversation", conversationId).catch(() => {});

    if (userId) {
      connection
        .invoke("MarkAsRead", {
          ConversationId: conversationId,
          ProfileId: userId,
        })
        .catch(() => {});
    }

    // =========================
    // Receive Message
    // =========================

    const handleReceiveMessage = function (incomingMessage: Message) {
      queryClient.setQueryData<InfiniteData<ChatResponse>>(
        ["chat", conversationId],

        (oldData) => {
          if (!oldData || oldData.pages.length === 0) {
            return oldData;
          }

          const messageExists = oldData.pages.some((page) =>
            page.data.messages.items.some(
              (msg: Message) => msg.messageId === incomingMessage.messageId,
            ),
          );

          // =========================
          // EXISTING MESSAGE
          // UPDATE REACTIONS
          // =========================

          if (messageExists) {
            return {
              ...oldData,

              pages: oldData.pages.map((page) => ({
                ...page,

                data: {
                  ...page.data,

                  messages: {
                    ...page.data.messages,

                    items: page.data.messages.items.map((msg: Message) => {
                      if (msg.messageId !== incomingMessage.messageId) {
                        return msg;
                      }

                      return {
                        ...msg,

                        totalReactionsCount:
                          incomingMessage.totalReactionsCount,

                        reactionsSummary: incomingMessage.reactionsSummary,

                        reactions: incomingMessage.reactions,
                      };
                    }),
                  },
                },
              })),
            };
          }

          // =========================
          // NEW MESSAGE
          // =========================

          const newPages = [...oldData.pages];

          newPages[0] = {
            ...newPages[0],

            data: {
              ...newPages[0].data,

              messages: {
                ...newPages[0].data.messages,

                items: [...newPages[0].data.messages.items, incomingMessage],
              },
            },
          };

          return {
            ...oldData,

            pages: newPages,
          };
        },
      );

      // =========================
      // REMOVE TYPING
      // =========================

      setTypingUser(null);

      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // =========================
      // MARK AS READ
      // =========================

      if (userId && incomingMessage.senderProfileId !== userId) {
        connection
          .invoke("MarkAsRead", {
            ConversationId: conversationId,

            ProfileId: userId,
          })
          .catch(() => {});
      }
    };

    // =========================
    // Message Seen
    // =========================

    const handleMessageSeen = function (data: {
      conversationId: string;
      messageId: string;
    }) {
      if (data.conversationId !== conversationId) {
        return;
      }

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
                    if (msg.senderProfileId === userId && !msg.isSeen) {
                      return {
                        ...msg,
                        isSeen: true,
                      };
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

    // =========================
    // Delete Message
    // =========================

    const handleDeleteMessage = function (data: {
      conversationId: string;
      messageId: string;
    }) {
      if (data.conversationId !== conversationId) {
        return;
      }

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

                  items: page.data.messages.items.filter(
                    (msg: Message) => msg.messageId !== data.messageId,
                  ),
                },
              },
            })),
          };
        },
      );
    };

    // =========================
    // Typing
    // =========================

    const handleUserTyping = function (data: {
      conversationId: string;
      userName: string;
      isTyping: boolean;
    }) {
      if (data.conversationId !== conversationId) {
        return;
      }

      // stop typing
      if (!data.isTyping) {
        setTypingUser(null);

        setIsTyping(false);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        return;
      }

      // start typing
      setTypingUser(data.userName);

      setIsTyping(true);

      // stale protection
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);

        setIsTyping(false);
      }, 2500);
    };

    // =========================
    // Listeners
    // =========================
    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("MessageFullySeen", handleMessageSeen);
    connection.on("MessageDeleted", handleDeleteMessage);
    connection.on("UserTyping", handleUserTyping);

    // =========================
    // Cleanup
    // =========================

    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("MessageFullySeen", handleMessageSeen);
      connection.off("MessageDeleted", handleDeleteMessage);
      connection.off("UserTyping", handleUserTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      connection.invoke("LeaveConversation", conversationId).catch(() => {});
    };
  }, [
    connection,
    conversationId,
    userId,
    queryClient,
    setTypingUser,
    setIsTyping,
  ]);
};
