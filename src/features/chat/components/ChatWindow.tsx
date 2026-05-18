/* eslint-disable react-hooks/set-state-in-effect */
import { useParams } from "react-router";
import { useGetChatById } from "../hooks/useGetChatById";
import { useChatWindowUpdates } from "../hooks/useChatWindowUpdates";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ChatSkeleton from "./ChatSkeleton";
import { useUser } from "../../../context/UserContext";
import { conversationImage } from "../../../utils/helper";
import { useChatOnline } from "../hooks/useChatOnline";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";

import type { Message } from "../types/chat.types";

function ChatWindow() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Reply State
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);

  const { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetChatById();

  const chatInfo = data?.pages?.[0]?.data;

  const senderProfileId = chatInfo?.otherParticipantProfileId || null;

  const lastSeen = chatInfo?.lastSeen;

  const { user } = useUser();

  usePageTitle(chatInfo?.title || "Chatting");

  useChatOnline(senderProfileId, setIsOnline);

  useChatWindowUpdates(
    conversationId,
    user?.userId,
    setTypingUser,
    setIsTyping,
  );

  const allMessages = data?.pages
    ? [...data.pages].reverse().flatMap((page) => page?.data?.messages.items)
    : [];

  const uniqueMessages = Array.from(
    new Map(allMessages.map((msg) => [msg.messageId, msg])).values(),
  );

  const imgUrl = conversationImage({
    isGroup: chatInfo?.isGroup || false,
    conversationPictureURL: chatInfo?.conversationPictureURL,
  });

  useEffect(() => {
    if (chatInfo?.isOnline !== undefined) {
      setIsOnline(chatInfo.isOnline);
    }
  }, [chatInfo?.isOnline]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden min-h-0">
      {isPending ? (
        <ChatSkeleton />
      ) : (
        <>
          <ChatHeader
            title={chatInfo?.title || ""}
            isOnline={isOnline}
            lastSeen={lastSeen || ""}
            isGroup={chatInfo?.isGroup || false}
            membersCount={chatInfo?.membersCount || 1}
            avatar={imgUrl}
          />

          <MessageList
            messages={uniqueMessages}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isGroup={chatInfo?.isGroup || false}
            isTyping={isTyping}
            typingUser={typingUser ?? ""}
            onReply={setReplyingMessage}
          />
        </>
      )}
      <MessageInput
        conversationId={conversationId || ""}
        replyingMessage={replyingMessage}
        onCancelReply={() => setReplyingMessage(null)}
      />
    </div>
  );
}

export default ChatWindow;
