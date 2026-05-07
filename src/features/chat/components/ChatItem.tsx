import { NavLink } from "react-router";
import Avatar from "./Avatar";
import type { ChatType } from "../../../types/ChatType";
import { HiOutlinePhoto } from "react-icons/hi2";
import {
  conversationImage,
  formatLastMessageDate,
} from "../../../utils/helper";

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
    lastMessageDate,
    lastMessageSender,
  } = chat;

  return (
    <NavLink
      to={`/chat/${conversationId}`}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 active:bg-gray-100 ${
          isActive ? "bg-gray-100" : ""
        }`
      }
    >
      <Avatar
        src={conversationImage({
          isGroup,
          conversationPictureURL: conversationPicture,
          otherUserProfilePicture,
        })}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Name + Message */}
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-gray-800 truncate">
              {isGroup ? groupTitle : otherUserName}
            </h4>

            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-gray-500 w-64 sm:w-56">
              {isGroup && (
                <span className="font-medium text-gray-600">
                  {lastMessageSender}:{" "}
                </span>
              )}
              {lastMessageType !== 2 ? (
                lastMessageContent
              ) : (
                <div className="flex items-center gap-1 font-medium">
                  <HiOutlinePhoto className="text-gray-900" />
                  <span className="text-gray-700">Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* Date + Unread */}
          <div className="flex flex-col items-end justify-start gap-1 min-w-fit">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {formatLastMessageDate(lastMessageDate)}
            </span>

            <div className="h-5 flex items-center justify-center">
              {unreadMessagesCount > 0 && (
                <span className="bg-primary-600 min-w-5 h-5 px-1.5 rounded-full text-[11px] font-medium text-white flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </NavLink>
  );
}

export default ChatItem;
