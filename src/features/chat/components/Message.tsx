import { IoCheckmarkDoneOutline } from "react-icons/io5";
import type { Attachment } from "../types/attachment.types";
import MessageAttachments from "./MessageAttachments";
import { HiOutlineChevronDown, HiTrash } from "react-icons/hi2";
import { useEffect, useRef, useState } from "react";
import { ReportModal } from "@/features/reports/components/ReportModal";
import { Flag } from "lucide-react";
import type { Message as TMessage } from "../types/message.types";
import { useUser } from "@/context/UserContext";
import { parseMessageContent } from "@/utils/helper";
import { useDeleteMessage } from "../hooks/useDeleteMessage";

type Props = {
  type: "send" | "receive";
  children: React.ReactNode;
  time: string;
  name?: string;
  attachments?: Attachment[];
  isGroup: boolean;
  isSeen: boolean;
  message: TMessage;
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

  return (
    <li className={`flex w-full ${isSend ? "justify-start" : "justify-end"}`}>
      <div
        className={`
          relative flex flex-col 
          px-3 pt-2 p-1
          shadow-md max-w-[75%] min-w-20 group
          ${
            !isSend
              ? "bg-gray-0 text-gray-800 rounded-tr-lg rounded-bl-lg"
              : "bg-primary-600 text-primary-50 rounded-tl-lg rounded-br-lg"
          }
        `}
      >
        {!isSend && name && isGroup && (
          <div className="flex items-center w-full">
            <span className="text-xs font-medium text-primary-600">{name}</span>
          </div>
        )}

        <HiOutlineChevronDown
          className={`
    absolute top-1 right-1
    opacity-0 
    group-hover:opacity-100 
    transition-all 
    duration-200 
    w-5 h-5 
    cursor-pointer 
    p-1
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
              rounded-xl shadow-lg 
              ring-1 ring-black/5 dark:ring-white/10 
              z-50
              border border-transparent dark:border-slate-700
              animate-fadeIn
            `}
          >
            <div
              className={`
                absolute -top-1 w-2 h-2 bg-inherit rotate-45
                border-l border-t border-black/5 dark:border-white/10
                ${isSend ? "left-4" : "right-4"}
              `}
            ></div>

            {!isSend && (
              <>
                <button
                  className="
                    flex items-center gap-2 w-full text-left 
                    px-4 py-2 text-sm 
                    text-red-500 dark:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-500/10 
                    transition-colors
                  "
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsReportOpen(true);
                  }}
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>

                <div className="h-px bg-gray-100 dark:bg-slate-700 mx-2" />
              </>
            )}
            {isSend && (
              <button
                disabled={isPending}
                className="
                flex items-center gap-2 w-full text-left 
                px-4 py-2 text-sm 
                text-red-600 
                hover:bg-red-50 dark:hover:bg-red-500/10 
                transition-colors
                "
                onClick={handleDelete}
              >
                <HiTrash className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        )}

        <MessageAttachments attachments={attachments} isSend={isSend} />

        <span className="text-xs leading-relaxed wrap-break-word">
          {typeof children === "string"
            ? parseMessageContent(children)
            : children}

          <span
            className={`
              inline-flex items-center gap-1 ml-2 whitespace-nowrap align-bottom
              ${isSend ? "text-primary-200" : "text-gray-400"}
            `}
          >
            <span className="text-[10px]">{time}</span>

            {isSend && (
              <IoCheckmarkDoneOutline
                size={14}
                className={`${isSeen ? "text-primary-400" : "text-gray-400"}`}
              />
            )}
          </span>
        </span>
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
    </li>
  );
}

export default Message;
