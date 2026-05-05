/* eslint-disable react-hooks/set-state-in-effect */
import { useParams, useOutletContext } from "react-router";
import { useGetChatById } from "../hooks/useGetChatById";
import { useChatWindowUpdates } from "../hooks/useChatWindowUpdates";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import ChatSkeleton from "./ChatSkeleton";
import type { HubConnection } from "@microsoft/signalr";
import { useUser } from "../../../context/UserContext";
import { conversationImage } from "../../../utils/helper";
import { useChatOnline } from "../hooks/useChatOnline";
import { useEffect, useState } from "react";

type ChatContextType = { chatConnection: HubConnection | null };

function ChatWindow() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetChatById();
  const chatInfo = data?.pages?.[0]?.data;
  const senderProfileId = chatInfo?.otherParticipantProfileId || null;
  const lastSeen = chatInfo?.lastSeen;
  const context = useOutletContext<ChatContextType>() as
    | ChatContextType
    | undefined;
  const connection = context?.chatConnection ?? null;
  const { user } = useUser();
  useEffect(() => {
    if (chatInfo?.isOnline !== undefined) {
      setIsOnline(chatInfo.isOnline);
    }
  }, [chatInfo?.isOnline]);
  useChatOnline(senderProfileId, setIsOnline);
  useChatWindowUpdates(connection, conversationId, user?.userId);

  if (isPending) return <ChatSkeleton />;

  const allMessages = data?.pages
    ? [...data.pages].reverse().flatMap((page) => page?.data?.messages.items)
    : [];
  const uniqueMessages = Array.from(
    new Map(allMessages.map((msg) => [msg.messageId, msg])).values(),
  );

  return (
    <div className="flex flex-col w-full h-dvh overflow-hidden">
      <ChatHeader
        title={chatInfo?.title || ""}
        isOnline={isOnline}
        lastSeen={lastSeen || ""}
        isGroup={chatInfo?.isGroup || false}
        membersCount={chatInfo?.membersCount || 1}
        avatar={conversationImage({
          isGroup: chatInfo?.isGroup || false,
          conversationPictureURL: chatInfo?.conversationPictureURL,
        })}
      />

      <MessageList
        messages={uniqueMessages}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isGroup={chatInfo?.isGroup || false}
      />

      <MessageInput conversationId={conversationId || ""} />
    </div>
  );
}

export default ChatWindow;
