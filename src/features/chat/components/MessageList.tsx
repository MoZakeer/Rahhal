import { formatDate } from "../../../utils/helper";
import { useUser } from "../../context/UserContext";
import Message from "./Message";

function MessageList({ messages }) {
  const { items } = messages;
  const {
    user: { userId },
  } = useUser();
  return (
    <div className="flex-1 overflow-y-auto">
      <ul className="flex flex-col gap-5 px-3 py-4 sm:py-6 sm:px-10">
        {items.map((message) => (
          <Message
            key={message.messageId}
            type={userId == message.senderProfileId ? "send" : "receive"}
            time={formatDate(message.createdDate)}
          >
            {message.content}
          </Message>
        ))}
      </ul>
    </div>
  );
}

export default MessageList;
