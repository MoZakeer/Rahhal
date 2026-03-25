import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useTheme } from "@/context/ThemeContext";

function ChatSkeleton() {
  const { theme } = useTheme();

  // 🎨 colors من design system
  const baseColor =
    theme === "dark" ? "var(--color-gray-200)" : "var(--color-gray-100)";

  const highlightColor =
    theme === "dark" ? "var(--color-gray-300)" : "var(--color-gray-200)";

  const skeletonMessages = [
    { type: "receive", lines: 2, width: "60%" },
    { type: "send", lines: 1, width: "80%" },
    { type: "receive", isImage: true },
    { type: "send", lines: 3, width: "90%" },
    { type: "receive", lines: 1, width: "40%" },
    { type: "receive", lines: 2, width: "70%" },
    { type: "send", lines: 1, width: "50%" },
    { type: "send", lines: 2, width: "65%" },
    { type: "receive", lines: 4, width: "85%" },
  ];

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="flex flex-col w-full h-dvh overflow-hidden bg-gray-50">
        {/* Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-gray-0 border-b border-gray-200 w-full h-18 shrink-0">
          <Skeleton circle width={48} height={48} />
          <div className="flex flex-col gap-1">
            <Skeleton width={150} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-5 px-3 py-4 sm:py-6 sm:px-10 overflow-y-auto no-scrollbar">
          {skeletonMessages.map((msg, index) => {
            const isSend = msg.type === "send";

            return (
              <div
                key={index}
                className={`flex w-full ${
                  isSend ? "justify-end" : "justify-start"
                }`}
              >
                {isSend ? (
                  <div className="bg-primary-600 p-3 rounded-2xl rounded-tr-none max-w-[75%] sm:max-w-[60%] w-64 shadow-sm">
                    {/* send bubble skeleton */}
                    <SkeletonTheme
                      baseColor="rgba(255,255,255,0.2)"
                      highlightColor="rgba(255,255,255,0.4)"
                    >
                      {msg.lines && msg.lines > 1 && (
                        <Skeleton
                          count={msg.lines - 1}
                          height={14}
                          className="mb-1"
                        />
                      )}
                      <Skeleton width={msg.width} height={14} />
                    </SkeletonTheme>
                  </div>
                ) : (
                  <div className="bg-gray-0 border border-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[75%] sm:max-w-[60%] w-72 shadow-sm">
                    {msg.isImage ? (
                      <>
                        <Skeleton height={150} className="mb-2 rounded-lg" />
                        <Skeleton width="40%" height={14} />
                      </>
                    ) : (
                      <>
                        {msg.lines && msg.lines > 1 && (
                          <Skeleton
                            count={msg.lines - 1}
                            height={14}
                            className="mb-1"
                          />
                        )}
                        <Skeleton width={msg.width} height={14} />
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-0 border-t border-gray-200 flex gap-3 items-center shrink-0">
          <Skeleton circle width={40} height={40} />
          <div className="flex-1">
            <Skeleton height={48} borderRadius={24} />
          </div>
          <Skeleton circle width={40} height={40} />
        </div>
      </div>
    </SkeletonTheme>
  );
}

export default ChatSkeleton;
