import { NavLink } from "react-router";
import Avatar from "./Avatar";
import {
  conversationImage,
  formatLastMessageDate,
} from "../../../utils/helper";
import type { ChatType } from "../types/chatType";
import { getSidebarMessagePreview } from "@/utils/getSidebarMessagePreview";

type Props = {
  chat: ChatType;
};

function ChatItem({ chat }: Props) {
  const {
    conversationId,
    isGroup,
    unreadMessagesCount,
    groupTitle,
    conversationPicture,
    otherUserName,
    otherUserProfilePicture,
    lastMessageType,
    lastMessageDate,
    lastMessageSender,
    lastMessageContent,
    reactionInfo,
    isTyping,
    typingUserName,
  } = chat;

  const preview = getSidebarMessagePreview({
    lastMessageContent,
    lastMessageType,
    reactionInfo,
    currentUserName: "You",
  });
  const PreviewIcon = preview.icon;
  return (
    <NavLink
      to={`/chat/${conversationId}`}
      replace={true}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-100 active:bg-gray-100
          ${isActive ? "bg-gray-100" : ""}`
      }
    >
      <Avatar
        src={conversationImage({
          isGroup,
          conversationPictureURL: conversationPicture,
          otherUserProfilePicture,
        })}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4
              title={isGroup ? groupTitle : otherUserName}
              className="text-base font-semibold text-gray-800 truncate"
            >
              {isGroup ? groupTitle : otherUserName}
            </h4>

            {isTyping ? (
              <p className="text-sm font-semibold text-primary-700 ">
                {isGroup && `${typingUserName} is `}
                typing...
              </p>
            ) : (
              <div
                title={lastMessageContent}
                className="whitespace-nowrap overflow-hidden text-ellipsis text-sm text-gray-500 w-64 sm:w-56 flex items-center gap-1"
              >
                {isGroup && lastMessageSender && !preview.isReaction && (
                  <span className="font-mediumtext-gray-600 shrink-0">
                    {lastMessageSender}:
                  </span>
                )}

                {PreviewIcon && (
                  <PreviewIcon className="text-gray-900 shrink-0 " size={16} />
                )}

                <span dir="auto" className="truncate">
                  {preview.text}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end justify-start gap-1 min-w-fit">
            {lastMessageDate && (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap ">
                {formatLastMessageDate(lastMessageDate)}
              </span>
            )}

            <div className=" h-5 flex items-center justify-center">
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
