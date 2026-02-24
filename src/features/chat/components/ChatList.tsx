import Spinner from "../../../shared/components/Spinner";
import type { ChatType } from "../../../types/ChatType";
import { useGetAllChats } from "../hooks/useGetAllChats";
import ChatItem from "./ChatItem";
import ChatSearch from "./ChatSearch";

function ChatList() {
  
  const { isPending, data } = useGetAllChats();

  const chatList = data?.data;
  return (
    <div className="w-full px-2 sm:px-4 py-8 sm:py-6 flex flex-col gap-8 overflow-auto max-h-screen">
      <h1 className="text-2xl font-semibold">Select a chat to get started</h1>
      <ChatSearch />
      <ul className="mt-4 flex flex-col gap-2.5">
        {isPending ? (
          <div className="h-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          chatList.map((chat: ChatType) => (
            <ChatItem chat={chat} key={chat.conversationId} />
          ))
        )}
      </ul>
    </div>
  );
}

export default ChatList;
