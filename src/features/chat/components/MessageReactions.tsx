import * as Popover from "@radix-ui/react-popover";
import type { ReactionSummary, Message as TMessage } from "../types/chat.types";
import ReactionDetailsModal from "./ReactionDetailsModal";

type Props = {
  reactionsSummary: ReactionSummary[];
  isSend: boolean;
  message: TMessage;
};

function MessageReactions({ reactionsSummary, isSend, message }: Props) {
  if (!reactionsSummary || reactionsSummary.length === 0) return null;

  const totalCount = reactionsSummary.reduce((acc, r) => acc + r.count, 0);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div
          className={`
            absolute -bottom-5.5
            ${isSend ? "left-2" : "right-2"} 
            z-20 cursor-pointer
          `}
        >
          <div className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full shadow-md bg-gray-0 border-gray-700 min-h-6 transition-transform hover:scale-105">
            <div className="flex items-center">
              {reactionsSummary.slice(0, 3).map((reaction, index) => (
                <span
                  key={reaction.emoji}
                  className={`text-[13px] leading-none relative ${index === 0 ? "ml-0.5" : "-ml-2.5"}`}
                  style={{ zIndex: 5 - index }}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
            {totalCount > 1 && (
              <span className="text-[11px] font-semibold ml-0.5 text-gray-600">
                {totalCount}
              </span>
            )}
          </div>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          sideOffset={8}
          align={isSend ? "start" : "end"}
          avoidCollisions={true}
          className="z-500 outline-none"
        >
          <ReactionDetailsModal message={message} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default MessageReactions;
