import { useEffect, useRef, useLayoutEffect, useMemo, useState } from "react";
import Message from "./Message";
import type { Message as TMessage } from "../types/chat.types";
import { formatDate } from "../../../utils/helper";
import { useUser } from "../../../context/UserContext";
// 1. Import the correct thin chevron icon
import { BsChevronDown } from "react-icons/bs";
import TypingIndicator from "./TypingIndicator";

interface MessageListProps {
  messages: TMessage[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isGroup: boolean;
  isTyping?: boolean;
  typingUser?: string;
}

function MessageList({
  messages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isGroup,
  isTyping,
  typingUser,
}: MessageListProps) {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const isFirstLoadRef = useRef(true);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const firstMessageIdRef = useRef<string | undefined>(undefined);

  const [showScrollButton, setShowScrollButton] = useState(false);

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

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    );
  }, [messages]);

  useLayoutEffect(() => {
    if (!sortedMessages || sortedMessages.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const currentFirstMessage = sortedMessages[0];
    const currentLastMessage = sortedMessages[sortedMessages.length - 1];

    if (isFirstLoadRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoadRef.current = false;
      lastMessageIdRef.current = currentLastMessage.messageId;
      firstMessageIdRef.current = currentFirstMessage.messageId;
      return;
    }

    if (lastMessageIdRef.current !== currentLastMessage.messageId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      lastMessageIdRef.current = currentLastMessage.messageId;
      firstMessageIdRef.current = currentFirstMessage.messageId;
      return;
    }

    if (
      firstMessageIdRef.current &&
      firstMessageIdRef.current !== currentFirstMessage.messageId
    ) {
      const oldFirstMessageElement = document.getElementById(
        `msg-${firstMessageIdRef.current}`,
      );

      if (oldFirstMessageElement) {
        container.scrollTop = oldFirstMessageElement.offsetTop - 50;
      }

      firstMessageIdRef.current = currentFirstMessage.messageId;
    }
  }, [messages, sortedMessages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollButton(distanceFromBottom > 150);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto no-scrollbar relative"
    >
      <div ref={observerTarget} className="w-full h-1" />

      {sortedMessages?.length === 0 ? (
        <div className="h-full flex justify-center items-center text-gray-500">
          There are no messages yet… start the conversation!
        </div>
      ) : (
        <ul className="flex flex-col gap-5 px-3 py-4 md:py-6 lg:pr-18 lg:pl-12">
          {sortedMessages.map((message: TMessage, index) => {
            const currentDate = getMessageDateLabel(message.createdDate);
            const prevMessage = sortedMessages[index - 1];
            const prevDate = prevMessage
              ? getMessageDateLabel(prevMessage.createdDate)
              : null;
            const showDateHeader = currentDate !== prevDate;

            return (
              <div
                key={`${message.messageId}-${index}`}
                id={`msg-${message.messageId}`}
              >
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
          {/* Typing  */}

          {isTyping && <TypingIndicator name={isGroup ? typingUser : ""} />}

          <div ref={messagesEndRef} />
        </ul>
      )}

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="sticky bottom-6 right-2   md:fixed md:bottom-24 md:right-4 md:translate-x-0 z-50  bg-primary-600 text-white rounded-full shadow-md backdrop-blur-sm hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 items-center justify-center  px-2 py-2 hidden sm:flex"
          aria-label="Scroll to bottom"
        >
          <BsChevronDown className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}

export default MessageList;
