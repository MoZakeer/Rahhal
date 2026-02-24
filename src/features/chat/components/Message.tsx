type Props = {
  type: "send" | "receive";
  children: React.ReactNode;
  time: string;
  name?: string;
};

function Message({ type, children, time, name }: Props) {
  const isSend = type === "send";

  return (
    <li className="flex w-full">
      <div
        className={`
          relative flex flex-col gap-0.5
          px-3 pt-1.5 pb-4
          shadow-md w-fit max-w-3/4
          ${
            isSend
              ? "bg-gray-0 text-gray-800 rounded-tr-lg rounded-bl-lg"
              : "ml-auto bg-primary-600 text-primary-50 rounded-tl-lg rounded-br-lg"
          }
        `}
      >
        {/* Name (group messages فقط) */}
        {!isSend && name && (
          <span className="text-xs font-medium text-primary-100 mb-0.5">
            {name}
          </span>
        )}

        {/* Message content */}
        <span className="text-sm leading-relaxed wrap-break-word">
          {children}
        </span>

        {/* Time */}
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
