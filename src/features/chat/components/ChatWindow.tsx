import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

function ChatWindow() {
  return (
    <div className=" flex flex-col w-full h-dvh overflow-auto">
      <ChatHeader />
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatWindow;
