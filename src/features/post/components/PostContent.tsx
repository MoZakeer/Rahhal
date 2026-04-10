import { useState } from "react";

export function PostContent({
  description,
  className = "",
}: {
  description?: string | null; 
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_LENGTH = 150;

  const text = description ?? ""; // ✅ fallback
  const isLong = text.length > MAX_LENGTH;

  const displayedText = isExpanded
    ? text
    : text.slice(0, MAX_LENGTH) + (isLong ? "..." : "");

  return (
    <p   onClick={() => setIsExpanded(!isExpanded)}

      className={`px-4 cursor-default text-slate-900/90 dark:text-slate-200/90 pb-2 ${className}`}
    >
      {displayedText}

      {isLong && (
        <span
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 cursor-pointer text-slate-500 dark:text-slate-500 text-sm"
        >
          {isExpanded ? " " : "see more"}
        </span>
      )}
    </p>
  );
}