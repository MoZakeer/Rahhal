import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function MessagePaginationSkeleton() {
  const skeletonMessages = [
    { type: "receive", lines: 2, width: "70%" },
    { type: "send", lines: 1, width: "50%" },
    { type: "receive", lines: 3, width: "85%" },
    { type: "send", lines: 2, width: "65%" },
    { type: "receive", isImage: true },
    { type: "send", lines: 1, width: "40%" },
  ];

  return (
    <div className="flex flex-col gap-5 py-2 w-full px-10">
      {skeletonMessages.map((msg, index) => {
        const isSend = msg.type === "send";

        return (
          <div
            key={index}
            className={`flex w-full ${isSend ? "justify-end" : "justify-start"}`}
          >
            {isSend ? (
              <div className="bg-primary-600 p-3 rounded-2xl rounded-tr-none max-w-[75%] sm:max-w-[60%] w-64 shadow-sm">
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
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[75%] sm:max-w-[60%] w-72 shadow-sm">
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
  );
}

export default MessagePaginationSkeleton;
