/* eslint-disable @typescript-eslint/no-explicit-any */
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { HiOutlinePhoto, HiOutlineVideoCamera, HiTrash } from "react-icons/hi2";
import { LuReply } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";
import { Flag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";

import type { Attachment, Message as TMessage } from "../types/chat.types";

import MessageAttachments from "./MessageAttachments";
import MessageReactions from "./MessageReactions";
import MessageReactionTrigger from "./MessageReactionTrigger";
import MessageReactionBar from "./MessageReactionBar";

import { ReportModal } from "@/features/reports/components/ReportModal";

import { useUser } from "@/context/UserContext";

import { parseMessageContent, getFileTypeFromUrl } from "@/utils/helper";

import { useDeleteMessage } from "../hooks/useDeleteMessage";

import { BASE_URL } from "@/utils/constant";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useReactToMessage } from "../hooks/useReactToMessage";

import { useLongPress } from "../hooks/useLongPress";

type Props = {
  type: "send" | "receive";
  children: React.ReactNode;
  time: string;
  name?: string;
  attachments?: Attachment[];
  isGroup: boolean;
  isSeen: boolean;
  message: TMessage;
  onReply: (message: TMessage) => void;

  openedMenuId: string | null;
  setOpenedMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  openedReactionId: string | null;
  setOpenedReactionId: React.Dispatch<React.SetStateAction<string | null>>;
};

function Message({
  type,
  children,
  time,
  name,
  attachments,
  isGroup,
  isSeen,
  message,
  onReply,
  openedMenuId,
  setOpenedMenuId,
  openedReactionId,
  setOpenedReactionId,
}: Props) {
  const isSend = type === "send";

  const [isReportOpen, setIsReportOpen] = useState(false);

  const menuRef = useOutsideClick<HTMLDivElement>(() => {
    if (openedMenuId === message.messageId) {
      setOpenedMenuId(null);
    }
  });
  const reactionBarRef = useOutsideClick<HTMLDivElement>(() => {
    if (openedReactionId === message.messageId) {
      setOpenedReactionId(null);
    }
  });
  const { isPending, deleteMessage } = useDeleteMessage();
  const { react } = useReactToMessage();
  const {
    user: { userId: reporterId },
  } = useUser();
  const currentUserReaction =
    message.reactions?.find((r) => r.profileId === reporterId)?.emoji || null;
  const x = useMotionValue(0);

  const rightSwipeOpacity = useTransform(x, [0, 50], [0, 1]);
  const rightSwipeScale = useTransform(x, [0, 50], [0.5, 1]);

  const leftSwipeOpacity = useTransform(x, [0, -50], [0, 1]);
  const leftSwipeScale = useTransform(x, [0, -50], [0.5, 1]);

  const handleDragEnd = (_event: unknown, info: any) => {
    if (Math.abs(info.offset.x) > 60) {
      onReply(message);

      if (window.navigator?.vibrate) {
        window.navigator.vibrate(20);
      }
    }
  };

  function handleDelete() {
    deleteMessage(message.messageId);
    setOpenedMenuId(null);
  }

  const repliedMessage = message.parentMessageInfo;

  const handleScrollToRepliedMessage = () => {
    if (!repliedMessage?.messageId) return;

    const targetElement = document.getElementById(
      `msg-${repliedMessage.messageId}`,
    );

    if (!targetElement) return;

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    targetElement.classList.add("highlight-message");

    setTimeout(() => {
      targetElement.classList.remove("highlight-message");
    }, 2000);
  };

  const getReplyPreviewData = function () {
    if (!repliedMessage) {
      return null;
    }

    const firstAttachment = repliedMessage.attachmentUrls?.[0];

    const attachmentUrl = firstAttachment?.fileUrl
      ? firstAttachment.fileUrl.startsWith("http")
        ? firstAttachment.fileUrl
        : `${BASE_URL}${firstAttachment.fileUrl}`
      : undefined;

    if (attachmentUrl) {
      const fileType = getFileTypeFromUrl(attachmentUrl);

      if (fileType === "image") {
        return {
          type: "image",
          text: "Photo",
          previewUrl: attachmentUrl,
        };
      }

      if (fileType === "video") {
        return {
          type: "video",
          text: "Video",
          previewUrl: attachmentUrl,
        };
      }

      return {
        type: "file",
        text: "Document",
        previewUrl: attachmentUrl,
      };
    }

    return {
      type: "text",
      text: repliedMessage.content || "Message",
    };
  };

  const replyPreview = getReplyPreviewData();

  const longPressEvents = useLongPress(
    () => {
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(20);
      }
      setOpenedReactionId(message.messageId);
      setOpenedMenuId(null);
    },
    { delay: 400, moveThreshold: 15 },
  );

  return (
    <li
      id={`msg-${message.messageId}`}
      className={`flex w-full items-center ${
        isSend ? "justify-start" : "justify-end"
      }`}
    >
      <div className="relative flex items-center">
        <motion.div
          style={{
            opacity: rightSwipeOpacity,
            scale: rightSwipeScale,
          }}
          className="
            absolute -left-10
            flex items-center justify-center
            w-8 h-8
            bg-gray-200 dark:bg-slate-700
            rounded-full
            z-0
          "
        >
          <LuReply className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </motion.div>

        <motion.div
          style={{
            opacity: leftSwipeOpacity,
            scale: leftSwipeScale,
          }}
          className="
            absolute -right-10
            flex items-center justify-center
            w-8 h-8
            bg-gray-200 dark:bg-slate-700
            rounded-full
            z-0
          "
        >
          <LuReply className="w-4 h-4 text-gray-600 dark:text-gray-300 transform -scale-x-100" />
        </motion.div>

        <motion.div
          style={{ x }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          {...longPressEvents}
          className={`
            relative flex flex-col overflow-visible

            ${openedMenuId === message.messageId ? "z-50" : "z-10"}

            px-3 pt-0.5 pb-1.5

            shadow-md

            max-w-70 sm:max-w-87.5
            min-w-20

            group

            ${
              !isSend
                ? "bg-gray-0 text-gray-800 rounded-tr-lg rounded-bl-lg"
                : "bg-primary-600 text-primary-50 rounded-tl-lg rounded-br-lg"
            }
          `}
        >
          {!isSend && name && isGroup && (
            <div className="flex items-center w-full mb-1">
              <Link to={`/profile/${message.senderProfileId}`}>
                <span className="text-xs font-medium text-primary-600 cursor-pointer hover:text-primary-700">
                  {name}
                </span>
              </Link>
            </div>
          )}
          <MessageReactionTrigger
            isSend={isSend}
            onClick={() =>
              setOpenedReactionId((prev) =>
                prev === message.messageId ? null : message.messageId,
              )
            }
          />
          {openedReactionId === message.messageId &&
            openedMenuId !== message.messageId && (
              <div
                ref={reactionBarRef}
                className={`
                  absolute
                  -top-12
                  z-60
                  ${isSend ? "left-0" : "right-0"}
                `}
              >
                <MessageReactionBar
                  currentReaction={currentUserReaction}
                  onReact={(emoji) => {
                    react({
                      messageId: message.messageId,
                      emoji,
                    });
                    setOpenedReactionId(null);
                  }}
                />
              </div>
            )}
          <FaChevronDown
            className={`hidden sm:flex absolute top-1 right-1 opacity-0
              group-hover:opacity-100 transition-all duration-200 text-3xl cursor-pointer z-50 pb-3 pl-2 font-bold
              ${isSeen ? "text-slate-200" : "text-primary-600"}`}
            onClick={() => {
              setOpenedReactionId(null);
              setOpenedMenuId((prev) =>
                prev === message.messageId ? null : message.messageId,
              );
            }}
          />
          {openedMenuId === message.messageId && (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className={`
                absolute
                -top-2
                ${
                  isSend
                    ? "left-[calc(100%+12px)] items-start"
                    : "right-[calc(100%+12px)] items-end"
                }
                z-100
                flex flex-col gap-2
              `}
            >
              <MessageReactionBar
                currentReaction={currentUserReaction}
                onReact={(emoji) => {
                  react({
                    messageId: message.messageId,
                    emoji,
                  });
                  setOpenedReactionId(null);
                }}
              />

              <div
                className={`
                  w-48
                  bg-gray-0 dark:bg-slate-800
                  rounded-xl
                  shadow-lg shadow-black/10
                  ring-1 ring-black/5 dark:ring-white/10
                  animate-fadeIn
                `}
              >
                <div className="relative flex flex-col py-1 overflow-hidden rounded-xl">
                  <button
                    className="
                      flex items-center gap-3
                      w-full text-left
                      px-4 py-2.5
                      text-sm font-medium
                      text-gray-700 
                      hover:bg-gray-100 dark:hover:bg-slate-700
                      transition-colors duration-200
                    "
                    onClick={() => {
                      onReply(message);
                      setOpenedMenuId(null);
                    }}
                  >
                    <LuReply className="w-5 h-5" />
                    Reply
                  </button>

                  {!isSend && (
                    <>
                      <div className="h-px bg-gray-100 dark:bg-slate-700/60 mx-3 my-0.5" />
                      <button
                        className="
                          flex items-center gap-3
                          w-full text-left
                          px-4 py-2.5
                          text-sm font-medium
                          text-red-600 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-500/10
                          transition-colors duration-200
                        "
                        onClick={() => {
                          setOpenedMenuId(null);
                          setIsReportOpen(true);
                        }}
                      >
                        <Flag className="w-5 h-5" />
                        Report
                      </button>
                    </>
                  )}

                  {isSend && (
                    <>
                      <div className="h-px bg-gray-100 dark:bg-slate-700/60 mx-3 my-0.5" />
                      <button
                        disabled={isPending}
                        className="
                          flex items-center gap-3
                          w-full text-left
                          px-4 py-2.5
                          text-sm font-medium
                          text-red-600 dark:text-red-400
                          hover:bg-red-50 dark:hover:bg-red-500/10
                          transition-colors duration-200
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                        onClick={handleDelete}
                      >
                        <HiTrash className="w-5 h-5" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {repliedMessage && replyPreview && (
            <button
              onClick={handleScrollToRepliedMessage}
              className={`
                mb-2
                text-left
                rounded-md
                px-2 py-1
                border-l-4
                transition-all hover:opacity-90
                flex items-center justify-between gap-2
                overflow-hidden

                ${
                  isSend
                    ? "bg-primary-500 border-primary-300"
                    : "bg-gray-100 border-primary-500"
                }
              `}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <p
                  className={`
                    text-[11px]
                    font-semibold
                    truncate

                    ${isSend ? "text-primary-100" : "text-primary-700"}
                  `}
                >
                  {repliedMessage.senderName}
                </p>

                <div
                  className={`
                    text-[11px]
                    truncate

                    flex items-center gap-1

                    ${isSend ? "text-primary-50" : "text-gray-600"}
                  `}
                >
                  {replyPreview.type === "image" && (
                    <span>
                      <HiOutlinePhoto />
                    </span>
                  )}

                  {replyPreview.type === "video" && (
                    <span>
                      <HiOutlineVideoCamera />
                    </span>
                  )}

                  {replyPreview.type === "file" && <span>📄</span>}

                  <span className="truncate">{replyPreview.text}</span>
                </div>
              </div>

              {replyPreview.previewUrl && (
                <div className="shrink-0 w-10 h-10 rounded overflow-hidden shadow-sm bg-black/5 dark:bg-white/5">
                  {replyPreview.type === "image" && (
                    <img
                      src={replyPreview.previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {replyPreview.type === "video" && (
                    <video
                      src={replyPreview.previewUrl}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  )}

                  {replyPreview.type === "file" && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-lg">
                      📄
                    </div>
                  )}
                </div>
              )}
            </button>
          )}
          <MessageAttachments attachments={attachments} isSend={isSend} />
          {!!children && (
            <div
              dir="auto"
              className="
                text-xs
                leading-relaxed
                wrap-break-word
                whitespace-pre-wrap
                pr-14 mr-2
              "
            >
              {typeof children === "string"
                ? parseMessageContent(children)
                : children}
            </div>
          )}
          <div
            dir="ltr"
            className={`
              absolute bottom-1 right-2
              flex items-center gap-1
              text-[10px]
              select-none
              ${isSend ? "text-primary-200" : "text-gray-400"}
            `}
          >
            <span>{time}</span>

            {isSend && (
              <IoCheckmarkDoneSharp
                size={14}
                className={isSeen ? "text-primary-100" : "text-black/60"}
              />
            )}
          </div>
          <MessageReactions
            reactionsSummary={message.reactionsSummary}
            isSend={isSend}
            message={message}
          />

          {isReportOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ReportModal
                open={isReportOpen}
                entityType="user"
                entityId={message.senderProfileId}
                reporterId={reporterId}
                messageId={message.messageId}
                onClose={() => setIsReportOpen(false)}
              />
            </div>
          )}
        </motion.div>
      </div>
    </li>
  );
}

export default Message;
