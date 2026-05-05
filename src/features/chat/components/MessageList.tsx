import { useEffect, useRef } from "react";
import Message from "./Message";
import type { Message as TMessage } from "../types/message.types";
import { formatDate } from "../../../utils/helper";
import { useUser } from "../../../context/UserContext";
import MessagePaginationSkeleton from "./MessagePaginationSkeleton";

interface MessageListProps {
  messages: TMessage[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isGroup: boolean;
}

function MessageList({
  messages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isGroup,
}: MessageListProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const isFirstLoadRef = useRef(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  const getMessageDateLabel = function (dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: "20px",
        threshold: 0,
      },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const currentLastMessage = messages[messages.length - 1];

    if (isFirstLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
      lastMessageIdRef.current = currentLastMessage.messageId;
      return;
    }

    if (lastMessageIdRef.current !== currentLastMessage.messageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMessageIdRef.current = currentLastMessage.messageId;
    }
  }, [messages]);

  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div ref={observerTarget} className="w-full h-1" />

      {isFetchingNextPage && <MessagePaginationSkeleton />}

      {messages?.length === 0 ? (
        <div className="h-full flex justify-center items-center text-gray-500">
          There are no messages yet… start the conversation!
        </div>
      ) : (
        <ul className="flex flex-col gap-5 px-3 py-4 sm:py-6 sm:px-10">
          {sortedMessages.map((message: TMessage, index) => {
            const currentDate = getMessageDateLabel(message.createdDate);

            const prevMessage = sortedMessages[index - 1];
            const prevDate = prevMessage
              ? getMessageDateLabel(prevMessage.createdDate)
              : null;

            const showDateHeader = currentDate !== prevDate;

            return (
              <div key={`${message.messageId}-${index}`}>
                {showDateHeader && (
                  <div className="flex justify-center my-3">
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-100 backdrop-blur text-gray-800 text-xs px-4 py-1.5 rounded-lg shadow-sm">
                        {currentDate}
                      </span>
                    </div>
                  </div>
                )}

                <Message
                  name={message.senderName}
                  type={
                    user?.userId === message?.senderProfileId
                      ? "send"
                      : "receive"
                  }
                  time={formatDate(message?.createdDate)}
                  attachments={message.attachments}
                  isGroup={isGroup}
                  isSeen={message.isSeen}
                  message={message}
                >
                  {message?.content}
                </Message>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </ul>
      )}
    </div>
  );
}

export default MessageList;
