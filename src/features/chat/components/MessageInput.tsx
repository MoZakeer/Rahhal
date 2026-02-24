/*import { LuSendHorizontal } from "react-icons/lu";

function MessageInput() {
  return (
    <div className="bg-gray-50 px-3 py-4 sm:pt-6 sm:pb-8 sm:px-15 ">
      <form className="flex gap-6 ">
        <input
          placeholder="Type a message..."
          className="w-full border border-solid border-gray-200 outline-none bg-gray-0 px-6 py-3 rounded-full"
        />
        <button className="bg-primary-600 px-2.5 py-2 rounded-full cursor-pointer ">
          <LuSendHorizontal className="w-8 h-8 aspect-square text-primary-50 " />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;*/
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { LuSendHorizontal, LuImage, LuSmile, LuX } from "react-icons/lu";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useUser } from "../../context/UserContext";
function MessageInput() {
  const { chatId } = useParams();
  const {
    user: { token },
  } = useUser();

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);

  // =============================
  // Image Preview
  // =============================
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // =============================
  // Close Emoji on outside click
  // =============================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // Send Message
  // =============================
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatId) return;
    if (!message.trim() && files.length === 0) return;

    setIsSending(true);

    const formData = new FormData();
    formData.append("ConversationId", chatId);
    formData.append("Content", message);

    files.forEach((file) => formData.append("AttachmentFiles", file));

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/Chat/SendMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setMessage("");
      setFiles([]);
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="bg-gray-50 px-3 py-4 sm:pt-6 sm:pb-8 sm:px-15 relative">
      {/* Preview Images */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt=""
                className="w-20 h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, index) => index !== i))
                }
                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
              >
                <LuX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-3">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="text-gray-500 hover:text-primary-600"
        >
          <LuSmile className="w-6 h-6" />
        </button>

        {/* File Upload */}
        <label className="cursor-pointer text-gray-500 hover:text-primary-600">
          <LuImage className="w-6 h-6" />
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </label>

        {/* Text Input */}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full border border-gray-200 outline-none px-6 py-3 rounded-full bg-white"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isSending}
          className={`px-2.5 py-2 rounded-full ${
            isSending
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary-600 cursor-pointer"
          }`}
        >
          <LuSendHorizontal className="w-6 h-6 text-white" />
        </button>
      </form>

      {/* Emoji Picker */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-20 left-0 sm:left-4 z-50"
        >
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}
    </div>
  );
}

export default MessageInput;
