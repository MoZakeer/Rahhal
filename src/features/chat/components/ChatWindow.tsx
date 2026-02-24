import Spinner from "../../../shared/components/Spinner";
import { useGetChatById } from "../hooks/useGetChatById";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

function ChatWindow() {
  const { isPending, data } = useGetChatById();
  if (isPending)
    return (
      <div className="flex justify-center items-center w-full">
        <Spinner />
      </div>
    );
  const { isGroup, conversationPictureURL, messages, title } = data.data;
  return (
    <div className=" flex flex-col w-full h-dvh overflow-auto">
      <ChatHeader
        title={title}
        avatar={
          (conversationPictureURL ?? isGroup)
            ? "../group-default.png"
            : "../private-default.png"
        }
      />

      <MessageList messages={messages} />

      <MessageInput />
    </div>
  );
}

export default ChatWindow;
