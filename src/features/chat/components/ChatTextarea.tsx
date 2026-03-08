import { useState, useRef, useLayoutEffect, type KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  placeholder?: string;
};

function ChatTextarea({ value, onChange, onEnter, placeholder }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const baseHeight = 48;

    el.style.height = "auto";
    const newHeight = el.scrollHeight;

    el.style.height = `${Math.min(newHeight, 128)}px`;

    setIsExpanded(newHeight > baseHeight);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (onEnter && value.trim()) {
        onEnter();
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      rows={1}
      placeholder={placeholder ?? "Type a message..."}
      className={`
        w-full
        border border-gray-200
        outline-none
        bg-gray-50
        px-6
        py-3
        resize-none
        overflow-y-auto
        transition-all duration-200
        no-scrollbar
        ${isExpanded ? "rounded-2xl" : "rounded-full"}
      `}
    />
  );
}

export default ChatTextarea;
