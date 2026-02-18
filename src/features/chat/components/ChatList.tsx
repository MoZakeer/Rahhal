import ChatItem from "./ChatItem";
import ChatSearch from "./ChatSearch";

function ChatList() {
  return (
    <div className="w-full px-2 sm:px-4 py-8 sm:py-6 flex flex-col gap-8 overflow-auto max-h-screen">
      <h1 className="text-2xl font-semibold">Select a chat to get started</h1>
      <ChatSearch />
      <ul className="mt-4 flex flex-col gap-2.5">
        <ChatItem />
      </ul>
    </div>
  );
}

export default ChatList;
