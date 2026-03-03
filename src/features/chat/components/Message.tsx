import type { Attachment } from "../types/attachment.types";
import MessageAttachments from "./MessageAttachments";

type Props = {
  type: "send" | "receive";
  children: React.ReactNode;
  time: string;
  name?: string;
  attachments?: Attachment[];
  isGroup: boolean;
};

function Message({ type, children, time, name, attachments, isGroup }: Props) {
  const isSend = type === "send";
  return (
    <li className={`flex w-full ${isSend ? "justify-start" : "justify-end"}`}>
      <div
        className={`
          relative flex flex-col gap-0.5
          px-1 pt-1 pb-3.5
          shadow-md max-w-[75%] min-w-17
          ${
            isSend
              ? "bg-gray-0 text-gray-800 rounded-tr-lg rounded-bl-lg"
              : "bg-primary-600 text-primary-50 rounded-tl-lg rounded-br-lg"
          }
        `}
      >
        {!isSend && name && isGroup && (
          <span className="text-xs font-medium text-primary-100 mb-0.5">
            {name}
          </span>
        )}

        <MessageAttachments attachments={attachments} isSend={isSend} />

        <span className="text-sm leading-relaxed wrap-break-word px-3">
          {children}
        </span>

        <span
          className={`
            text-[10px] absolute right-2 bottom-1
            ${isSend ? "text-gray-400" : "text-primary-200"}
          `}
        >
          {time}
        </span>
      </div>
    </li>
  );
}

export default Message;
