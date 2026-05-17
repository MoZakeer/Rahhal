import { NavLink } from "react-router";

import { HiOutlinePhoto, HiOutlineVideoCamera } from "react-icons/hi2";
import Avatar from "./Avatar";

import {
  conversationImage,
  formatLastMessageDate,
} from "../../../utils/helper";
import { MessageType } from "../types/MessageType";
import type { ChatType } from "../types/chatType";

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
    isTyping,
    typingUserName,
  } = chat;

  return (
    <NavLink
      to={`/chat/${conversationId}`}
      replace={true}
      className={({ isActive }) =>
        `
          flex items-center gap-3
          px-4 py-2.5
          rounded-lg
          cursor-pointer
          transition-all duration-300
          hover:bg-gray-100
          active:bg-gray-100
          ${isActive ? "bg-gray-100" : ""}
        `
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
        <div
          className="
            flex items-start
            justify-between
            gap-2
          "
        >
          {/* Left */}
          <div className="min-w-0">
            <h4
              className="
                text-base
                font-semibold
                text-gray-800
                truncate
              "
            >
              {isGroup ? groupTitle : otherUserName}
            </h4>
            {isTyping ? (
              <p className="text-sm font-semibold text-primary-700">
                {isGroup && `${typingUserName} is`} typing...
              </p>
            ) : (
              <div
                className="
                whitespace-nowrap
                overflow-hidden
                text-ellipsis
                text-sm
                text-gray-500
                w-64 sm:w-56
                flex items-center
              "
              >
                {isGroup && lastMessageType && (
                  <span
                    className="
                      font-medium
                      text-gray-600
                      mr-1
                      shrink-0
                    "
                  >
                    {lastMessageSender}:
                  </span>
                )}

                {lastMessageType === MessageType.Image ? (
                  <div
                    className="
                    ml-0.5
                    flex items-center gap-1
                    font-medium
                  "
                  >
                    <HiOutlinePhoto className="text-gray-900" size={16} />

                    <span
                      className="
                      text-gray-700
                      text-[14px]
                      font-medium
                    "
                    >
                      Photo
                    </span>
                  </div>
                ) : lastMessageType === MessageType.Video ? (
                  <div
                    className="
                    ml-0.5
                    flex items-center gap-1
                    font-medium
                  "
                  >
                    <span>
                      <HiOutlineVideoCamera
                        className="text-gray-900"
                        size={16}
                      />
                    </span>

                    <span
                      className="
                      text-gray-700
                      text-[14px]
                      font-medium
                    "
                    >
                      Video
                    </span>
                  </div>
                ) : (
                  <span dir="auto" className="truncate">
                    {lastMessageContent}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div
            className="
              flex flex-col
              items-end
              justify-start
              gap-1
              min-w-fit
            "
          >
            {lastMessageDate && (
              <span
                className="
                  text-xs
                  text-gray-500
                  font-medium
                  whitespace-nowrap
                "
              >
                {formatLastMessageDate(lastMessageDate)}
              </span>
            )}

            <div
              className="
                h-5
                flex items-center
                justify-center
              "
            >
              {unreadMessagesCount > 0 && (
                <span
                  className="
                    bg-primary-600
                    min-w-5 h-5
                    px-1.5
                    rounded-full
                    text-[11px]
                    font-medium
                    text-white
                    flex items-center
                    justify-center
                  "
                >
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
