import { useState, useEffect, useRef } from "react";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import MyEmojiPicker from "../../../chat/components/EmojiPicker";

type Props = {
  caption: string;
  onChange: (value: string) => void;
  maxChars: number;
  placeholder?: string;
};

export default function PostCaption({
  caption,
  onChange,
  maxChars,
  placeholder,
}: Props) {
  const [showEmoji, setShowEmoji] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const remaining = maxChars - caption.length;
  const warning = remaining <= 50;

  const handleEmojiSelect = (emoji: string) => {
    onChange(caption + emoji);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    }

    if (showEmoji) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showEmoji]);

  return (
    <div className="flex flex-col gap-2 relative w-full">
      <div className="relative">
        <textarea
          value={caption}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxChars}
          placeholder={placeholder}
          rows={5}
          className="
            w-full
            resize-none
            bg-gray-50
            rounded-xl
            px-4
            py-3
            border border-gray-100
            text-sm
            text-gray-800
            placeholder:text-gray-400
            outline-none
            focus:ring-2
            focus:ring-[var(--color-primary-500)]
          "
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowEmoji((prev) => !prev);
          }}
          className="absolute right-2 bottom-2 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <HiOutlineFaceSmile className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div
        className={`text-right text-xs ${warning ? "text-red-500" : "text-gray-400"}`}
      >
        {caption.length}/{maxChars}
      </div>

      {showEmoji && (
        <div
          ref={pickerRef}
          className="absolute top-full right-0 mt-1 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <MyEmojiPicker
            onSelect={handleEmojiSelect}
            width={300}
            height={320}
          />
        </div>
      )}
    </div>
  );
}
