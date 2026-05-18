import { useState } from "react";
import { LuSendHorizontal, LuX } from "react-icons/lu";
import {
  HiOutlineFaceSmile,
  HiOutlinePhoto,
  HiOutlineVideoCamera,
} from "react-icons/hi2";

import MyEmojiPicker from "./EmojiPicker";
import ChatTextarea from "./ChatTextarea";
import ImagePreviewArea from "./ImagePreviewArea";
import ImageAttachButton from "./ImageAttachButton";

import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useSendMessage } from "../hooks/useSendMessage";
import { useTyping } from "../hooks/useTyping";
import type { Message } from "../types/chat.types";
import { BASE_URL } from "@/utils/constant";
import { getFileTypeFromUrl } from "@/utils/helper";

type Props = {
  conversationId: string;
  replyingMessage: Message | null;
  onCancelReply: () => void;
};

function MessageInput({
  conversationId,
  replyingMessage,
  onCancelReply,
}: Props) {
  const [message, setMessage] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const { isPending, sendMessage } = useSendMessage();
  const { handleTyping, stopTyping } = useTyping();

  const pickerRef = useOutsideClick<HTMLDivElement>(() => {
    if (showEmoji) setShowEmoji(false);
  });

  function handleEmojiSelect(emoji: string) {
    setMessage((message) => message + emoji);
    handleTyping();
  }

  const handleAddFiles = (newFiles: File[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }
    handleTyping();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isPending) return;
    if (!message.trim() && attachments.length === 0) {
      return;
    }

    stopTyping();

    sendMessage(
      {
        conversationId,
        content: message,
        files: attachments,
        parentMessageId: replyingMessage?.messageId,
      },
      {
        onSuccess: () => {
          setMessage("");
          setAttachments([]);
          onCancelReply();
        },
      },
    );
  };

  const getReplyPreviewData = () => {
    if (!replyingMessage) {
      return null;
    }

    const firstAttachment =
      replyingMessage.attachments?.[0] || replyingMessage.attachments?.[0];

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
      text: replyingMessage.content || "Message",
    };
  };

  const replyPreview = getReplyPreviewData();
  const isSubmitDisabled =
    isPending || (!message.trim() && attachments.length === 0);

  return (
    <div className="px-1 sm:px-4 pb-1 sm:pb-6 relative flex flex-col w-full shrink-0 z-10">
      <ImagePreviewArea files={attachments} onRemove={handleRemoveFile} />

      <form
        onSubmit={handleSubmit}
        className="flex w-full items-end gap-1.5 sm:gap-0"
      >
        <div
          className={`
            flex-1 flex flex-col relative
            bg-gray-0 
            transition-all duration-300 ease-in-out
            shadow-sm border border-gray-200
            ${replyingMessage ? "rounded-2xl" : "rounded-4xl"} 
          `}
        >
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              replyingMessage && replyPreview
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {replyingMessage && replyPreview && (
                <div className="pt-2 px-2">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-100 rounded-lg border-l-4 border-l-primary-600">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <span
                        className="text-[13px] font-semibold text-primary-600 truncate mb-0.5"
                        dir="auto"
                      >
                        {replyingMessage.senderName}
                      </span>
                      <p
                        className="text-[13px] text-gray-500 truncate flex items-center gap-1"
                        dir="auto"
                      >
                        {replyPreview.type === "image" && <HiOutlinePhoto />}
                        {replyPreview.type === "video" && (
                          <HiOutlineVideoCamera />
                        )}
                        {replyPreview.type === "file" && "📎 "}
                        {replyPreview.text}
                      </p>
                    </div>

                    {replyPreview.previewUrl &&
                      replyPreview.type === "image" && (
                        <img
                          src={replyPreview.previewUrl}
                          alt="Preview"
                          className="w-10 h-10 object-cover rounded-md shrink-0"
                        />
                      )}

                    {replyPreview.previewUrl &&
                      replyPreview.type === "video" && (
                        <video
                          src={`${replyPreview.previewUrl}#t=0.1`}
                          className="w-10 h-10 object-cover rounded-md shrink-0 bg-black"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      )}

                    <button
                      type="button"
                      onClick={onCancelReply}
                      className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                    >
                      <LuX className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end gap-1 px-1 sm:px-2 pt-1.5 pb-1 min-h-12">
            <div
              ref={pickerRef}
              className="flex items-center gap-0.5 sm:gap-1 mb-0.5"
            >
              <div className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                <ImageAttachButton onSelectFiles={handleAddFiles} />
              </div>

              <button
                type="button"
                onClick={() => setShowEmoji((prev) => !prev)}
                className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
              >
                <HiOutlineFaceSmile className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>

              {showEmoji && (
                <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-xl">
                  <MyEmojiPicker onSelect={handleEmojiSelect} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center mb-1 px-1">
              <ChatTextarea
                value={message}
                onChange={handleMessageChange}
                onEnter={handleSubmit}
                onPasteFiles={handleAddFiles}
                dir="auto"
              />
            </div>

            <div className="hidden sm:flex mb-0.5 pr-1 shrink-0">
              <button
                disabled={isSubmitDisabled}
                type="submit"
                className="
                  text-primary-600 hover:bg-gray-100
                  rounded-full p-2
                  disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-transparent
                  transition-all duration-200
                "
              >
                <LuSendHorizontal className="w-6 h-6 rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex sm:hidden shrink-0 mb-1">
          <button
            disabled={isSubmitDisabled}
            type="submit"
            className="
              flex items-center justify-center
              w-11.5 h-11.5 mb-1
              text-white bg-primary-600
              rounded-full shadow-sm
              disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400
              transition-all duration-200 active:scale-95
            "
          >
            <LuSendHorizontal className="w-5 h-5 rtl:-scale-x-100" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
