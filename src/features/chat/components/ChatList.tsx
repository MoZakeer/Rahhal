import { useState } from "react";
import type { ChatType } from "../../../types/ChatType";
import { useGetAllChats } from "../hooks/useGetAllChats";
import ChatItem from "./ChatItem";
import ChatItemSkeleton from "./ChatItemSkeleton";
import ChatSearch from "./ChatSearch";
import { HiOutlineChevronLeft } from "react-icons/hi2";
import { useNavigate } from "react-router";

function ChatList() {
  const navigate = useNavigate();
  const { isPending, data } = useGetAllChats();

  const [query, setQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "private" | "group">(
    "all",
  );

  const chatList: ChatType[] = data?.data;

  // 🔥 Tabs config
  const tabs = [
    { key: "all", label: "All" },
    { key: "private", label: "Private" },
    { key: "group", label: "Group" },
  ] as const;

  // 🔥 Filter logic
  const filteredList = chatList
    ?.filter(
      (chat) =>
        chat?.groupTitle?.toLowerCase().includes(query.toLowerCase()) ||
        chat?.otherUserName?.toLowerCase().includes(query.toLowerCase()),
    )
    ?.filter((chat) => {
      if (activeTab === "all") return true;
      if (activeTab === "private") return !chat.isGroup;
      if (activeTab === "group") return chat.isGroup;
    });

  return (
    <div className="w-full h-full flex flex-col overflow-hidden max-h-screen bg-gray-0">
      <div className="px-2 sm:px-4 pt-8 sm:pt-6 pb-4 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-1 text-gray-800 hover:bg-gray-100 flex items-center justify-center"
            onClick={() => navigate("/feed")}
          >
            <HiOutlineChevronLeft className="w-6 h-6" />
          </button>

          <h1 className="text-2xl font-semibold text-gray-800">
            Select a chat to get started
          </h1>
        </div>

        <ChatSearch onSearch={setQuery} />

        {/* 🔥 Tabs */}
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${
                  activeTab === tab.key
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-gray-0 border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-2 sm:px-4 pb-4 no-scrollbar">
        {isPending
          ? Array.from({ length: 16 }).map((_, index) => (
              <ChatItemSkeleton key={index} />
            ))
          : filteredList?.map((chat: ChatType) => (
              <ChatItem chat={chat} key={chat.conversationId} />
            ))}
      </ul>
    </div>
  );
}

export default ChatList;
