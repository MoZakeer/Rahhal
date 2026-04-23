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
import { useSignalRConnection } from "../hooks/useSignalRConnection";
import { useChatOnline } from "../hooks/useChatOnline";
import { useState } from "react";

type ChatContextType = { connection: HubConnection | null };

function ChatWindow() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetChatById();
  const senderProfileId =
    data?.pages?.[0].data.otherParticipantProfileId || null;
  const lastSeen = data?.pages?.[0].data.lastSeen;
  const context = useOutletContext<ChatContextType>() as
    | ChatContextType
    | undefined;
  const connection = context?.connection ?? null;
  const { user } = useUser();

  const presenceConnection = useSignalRConnection("/Realtime/presenceHub");
  useChatOnline(presenceConnection, senderProfileId, setIsOnline);

  useChatWindowUpdates(connection, conversationId, user?.userId);

  if (isPending) return <ChatSkeleton />;

  const chatInfo = data?.pages?.[0]?.data;

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
