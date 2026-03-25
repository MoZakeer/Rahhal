import { NavLink } from "react-router";

import Avatar from "./Avatar";
import type { ChatType } from "../../../types/ChatType";
import { HiOutlinePhoto } from "react-icons/hi2";
import { conversationImage } from "../../../utils/helper";

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
    lastMessageType,
  } = chat;

  return (
    <NavLink
      to={`/chat/${conversationId}`}
      className={({ isActive }) =>
        `flex items-center gap-2  px-4 py-2.5 rounded-lg cursor-pointer   transition-all duration-300 hover:bg-gray-100  active:bg-gray-100 ${isActive && "bg-gray-100"} `
      }
    >
      <Avatar
        src={conversationImage({
          isGroup,
          conversationPictureURL: conversationPicture,
          otherUserProfilePicture,
        })}
      />
      <div className="flex flex-col">
        <h4 className="text-xl font-medium text-gray-800">
          {isGroup ? groupTitle : otherUserName}
        </h4>
        <p className="whitespace-nowrap overflow-hidden text-ellipsis text-gray-500 w-64 sm:w-56">
          {lastMessageType !==2  ? (
            lastMessageContent
          ) : (
            <div className="flex items-center gap-1 font-medium">
              <HiOutlinePhoto className="text-gray-900" />
              <span className="text-gray-700">Photo</span>
            </div>
          )}
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
