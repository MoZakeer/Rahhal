import { useState, useRef, useLayoutEffect, type KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void; // ضفنا دي عشان نبعت الرسالة لما يدوس Enter
  placeholder?: string;
};

function ChatTextarea({ value, onChange, onEnter, placeholder }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // استخدمنا useLayoutEffect عشان التعديل يحصل قبل ما الشاشة تترسم (يمنع الرعشة)
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    // بنحفظ الارتفاع الأساسي عشان نقارن بيه (بدل الرقم 48)
    const baseHeight = 48; // لو حبيت تحسبها ديناميكي: el.style.lineHeight أو غيره، بس الـ 48 هنا آمنة لو الـ CSS ثابت

    el.style.height = "auto";
    const newHeight = el.scrollHeight;

    // بنخلي الـ max-height يشتغل صح مع الـ inline style
    el.style.height = `${Math.min(newHeight, 128)}px`; // 128px اللي هي max-h-32

    setIsExpanded(newHeight > baseHeight);
  }, [value]);

  // دالة للتعامل مع زراير الكيبورد
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // لو داس Enter من غير Shift، نبعت الرسالة ونمنع النزول لسطر جديد
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // نمنع سطر جديد
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
