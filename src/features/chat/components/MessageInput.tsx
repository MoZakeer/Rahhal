import { useState } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import MyEmojiPicker from "./EmojiPicker";
import ChatTextarea from "./ChatTextarea";
import ImagePreviewArea from "./ImagePreviewArea";
import ImageAttachButton from "./ImageAttachButton";
import { useOutsideClick } from "../../../hooks/useOutsideClick";
import { useSendMessage } from "../hooks/useSendMessage";

function MessageInput({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState<string>("");
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const { isPending, sendMessage } = useSendMessage();

  const pickerRef = useOutsideClick<HTMLDivElement>(() => {
    if (showEmoji) setShowEmoji(false);
  });

  function handleEmojiSelect(emoji: string) {
    setMessage((message) => message + emoji);
  }

  const handleAddFiles = (newFiles: File[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && attachments.length == 0) return;
    sendMessage(
      {
        conversationId,
        content: message,
        files: attachments,
      },
      {
        onSuccess: () => {
          setMessage("");
          setAttachments([]);
        },
      },
    );
  };

  return (
    <div className="bg-gray-50 px-3 py-4 sm:pt-6 sm:pb-8 sm:px-15 relative flex flex-col">
      <ImagePreviewArea files={attachments} onRemove={handleRemoveFile} />

      <form
        onSubmit={handleSubmit}
        className="flex sm:gap-4 gap-2 items-end w-full "
      >
        <div ref={pickerRef} className="flex ">
          <ImageAttachButton onSelectFiles={handleAddFiles} />

          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="cursor-pointer transition-all duration-300 hover:bg-gray-100 p-2 rounded-full"
          >
            <HiOutlineFaceSmile className="w-8 h-8 aspect-square text-gray-700" />
          </button>

          {showEmoji && (
            <div className="absolute bottom-24 left-6 z-50">
              <MyEmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        <ChatTextarea
          value={message}
          onChange={setMessage}
          onEnter={handleSubmit}
        />

        <button
          disabled={isPending || (!message && !attachments.length)}
          type="submit"
          className="bg-primary-600 px-2.5 py-2 rounded-full cursor-pointer transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-primary-600"
        >
          <LuSendHorizontal className="w-8 h-8 aspect-square text-primary-50" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
