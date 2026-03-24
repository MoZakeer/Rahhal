import { useState } from "react";
import type { ChatType } from "../../../types/ChatType";
import { useGetAllChats } from "../hooks/useGetAllChats";
import ChatItem from "./ChatItem";
import ChatItemSkeleton from "./ChatItemSkeleton";
import ChatSearch from "./ChatSearch";

function ChatList() {
  const { isPending, data } = useGetAllChats();
  const [query, setQuery] = useState<string>("");
  const chatList: ChatType[] = data?.data;
  const filterdList = chatList?.filter(
    (chat) =>
      chat?.groupTitle?.toLowerCase().includes(query.toLowerCase()) ||
      chat?.otherUserName?.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden max-h-screen bg-gray-0">
      <div className="px-2 sm:px-4 pt-8 sm:pt-6 pb-4 flex flex-col gap-6 shrink-0">
        <h1 className="text-2xl font-semibold text-gray-800">Select a chat to get started</h1>
        <ChatSearch onSearch={setQuery} />
      </div>

      <ul className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-2 sm:px-4 pb-4 no-scrollbar">
        {isPending 
          ? Array.from({ length: 16 }).map((_, index) => (
              <ChatItemSkeleton key={index} />
            ))
          : filterdList?.map((chat: ChatType) => (
              <ChatItem chat={chat} key={chat.conversationId} />
            ))}
      </ul>
    </div>
  );
}

export default ChatList;
