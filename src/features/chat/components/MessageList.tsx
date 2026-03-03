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

  const observerTarget = useRef<HTMLDivElement>(null);

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

    if (lastMessageIdRef.current !== currentLastMessage.messageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMessageIdRef.current = currentLastMessage.messageId;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <div ref={observerTarget} className="w-full h-1" />

      {isFetchingNextPage && <MessagePaginationSkeleton />}

      {messages?.length === 0 ? (
        <div className="h-full flex justify-center items-center text-gray-500">
          There are no messages yet… start the conversation!{" "}
        </div>
      ) : (
        <ul className="flex flex-col gap-5 px-3 py-4 sm:py-6 sm:px-10">
          {messages.map((message: TMessage, index) => (
            <Message
              name={message.senderName}
              key={`${message.messageId}-${index}`}
              type={
                user?.userId === message?.senderProfileId ? "send" : "receive"
              }
              time={formatDate(message?.createdDate)}
              attachments={message.attachments}
              isGroup={isGroup}
            >
              {message?.content}
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      )}
    </div>
  );
}

export default MessageList;
