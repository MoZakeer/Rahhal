import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { HiOutlinePhoto, HiOutlineVideoCamera } from "react-icons/hi2";

import type { Attachment, Message as TMessage } from "../types/chat.types";
import MessageAttachments from "./MessageAttachments";
import { HiTrash } from "react-icons/hi2";
import { LuReply } from "react-icons/lu";
import { useEffect, useRef, useState } from "react";
import { ReportModal } from "@/features/reports/components/ReportModal";
import { Flag } from "lucide-react";
import { useUser } from "@/context/UserContext";

import { parseMessageContent } from "@/utils/helper";
import { getFileTypeFromUrl } from "@/utils/helper";

import { useDeleteMessage } from "../hooks/useDeleteMessage";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { BASE_URL } from "@/utils/constant";

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
}: Props) {
  const isSend = type === "send";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { isPending, deleteMessage } = useDeleteMessage();
  const {
    user: { userId: reporterId },
  } = useUser();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  function handleDelete() {
    deleteMessage(message.messageId);
    setIsMenuOpen(false);
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

  return (
    <li
      id={`msg-${message.messageId}`}
      className={`flex w-full ${isSend ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`
          relative flex flex-col
          px-3 pt-0.5 pb-1.5
          shadow-md max-w-[75%] min-w-20 group
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

        <FaChevronDown
          className={`
            absolute top-1 right-1
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-200
            text-3xl
            cursor-pointer
            z-100
            pb-3
            pl-2
            ${!isSeen ? "text-primary-600" : "text-gray-100"}
            font-bold
          `}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen((prev) => !prev);
          }}
        />

        {isMenuOpen && (
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            className={`
      absolute top-8
      ${isSend ? "left-2" : "right-2"}
      w-40
      bg-white dark:bg-slate-800
      rounded-xl shadow-lg shadow-black/10
      ring-1 ring-black/5 dark:ring-white/10
      z-100
      animate-fadeIn
    `}
          >
            <div
              className={`
        absolute -top-1.5 w-3 h-3
        bg-white dark:bg-slate-800
        rotate-45
        border-l border-t border-black/5 dark:border-white/10
        ${isSend ? "left-4" : "right-4"}
      `}
            />

            <div className="relative flex flex-col py-1 overflow-hidden rounded-xl">
              <button
                className="
          flex items-center gap-2.5 w-full text-left
          px-4 py-2.5 text-sm font-medium
          text-gray-700 
          hover:bg-gray-100 dark:hover:bg-slate-700
          transition-colors duration-200
        "
                onClick={() => {
                  onReply(message);
                  setIsMenuOpen(false);
                }}
              >
                <LuReply className="w-5 h-5 " />
                Reply
              </button>

              {!isSend && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-slate-700/60 mx-3 my-0.5" />
                  <button
                    className="
              flex items-center gap-2.5 w-full text-left
              px-4 py-2.5 text-sm font-medium
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition-colors duration-200
            "
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsReportOpen(true);
                    }}
                  >
                    <Flag className="w-4 h-4" />
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
              flex items-center gap-2.5 w-full text-left
              px-4 py-2.5 text-sm font-medium
              text-red-600 dark:text-red-400
              hover:bg-red-50 dark:hover:bg-red-500/10
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    onClick={handleDelete}
                  >
                    <HiTrash className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
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
              transition-all
              hover:opacity-90
              flex items-center justify-between gap-2 overflow-hidden
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
                    <HiOutlinePhoto />{" "}
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
              pr-14
              mr-2
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
            text-[10px] select-none
            ${isSend ? "text-primary-200" : "text-gray-400"}
          `}
        >
          <span>{time}</span>

          {isSend && (
            <IoCheckmarkDoneSharp
              size={14}
              className={`${isSeen ? "text-primary-400" : "text-gray-400"}`}
            />
          )}
        </div>

        {isReportOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <ReportModal
              entityType="user"
              entityId={message.senderProfileId}
              reporterId={reporterId}
              messageId={message.messageId}
              onClose={() => setIsReportOpen(false)}
            />
          </div>
        )}
      </div>
    </li>
  );
}

export default Message;
