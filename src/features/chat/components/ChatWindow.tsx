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

type ChatContextType = { connection: HubConnection | null };

function ChatWindow() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const { isPending, data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetChatById();

  const context = useOutletContext<ChatContextType>() as
    | ChatContextType
    | undefined;
  const connection = context?.connection ?? null;
  const { user } = useUser();
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
