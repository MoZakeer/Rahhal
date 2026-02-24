import { NavLink } from "react-router";
import Avatar from "./Avatar";
import type { ChatType } from "../../../types/ChatType";

type Props = {
  chat: ChatType;
};
function ChatItem({ chat }: Props) {
  const {
    conversationId,
    isGroup,
    lastMessageContent,
    unreadMessagesCount,
    groupTitle,
    conversationPicture,
    otherUserName,
    otherUserProfilePicture,
  } = chat;
  const src = isGroup
    ? (conversationPicture ?? "./group-default.png")
    : (otherUserProfilePicture ?? "../private-default.png");

  return (
    <NavLink
      to={`/chat/${conversationId}`}
      className={({ isActive }) =>
        `flex items-center gap-2  px-4 py-2.5 rounded-lg cursor-pointer   transition-all duration-300 hover:bg-gray-100  active:bg-gray-100 ${isActive && "bg-gray-100"} `
      }
    >
      <Avatar src={src} />
      <div className="flex flex-col">
        <h4 className="text-xl font-medium">
          {isGroup ? groupTitle : otherUserName}
        </h4>
        <p className="whitespace-nowrap overflow-hidden text-ellipsis text-gray-500 w-64 sm:w-56">
          {lastMessageContent}
        </p>
      </div>
      {Boolean(unreadMessagesCount > 0) && (
        <p className="bg-primary-600  px-2 py rounded-full font-medium text-primary-50  ml-auto">
          {unreadMessagesCount}
        </p>
      )}
    </NavLink>
  );
}

export default ChatItem;
