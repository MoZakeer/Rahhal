import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "../types/chat.types";
import { BASE_URL } from "@/utils/constant";
import { useUser } from "@/context/UserContext";
import { useReactToMessage } from "../hooks/useReactToMessage";

type Props = {
  message: Message;
};

export default function ReactionDetailsModal({ message }: Props) {
  const { user } = useUser();
  const { react } = useReactToMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-gray-0  w-80 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
        <h2 className="text-[15px] font-medium text-gray-800 dark:text-gray-200">
          {message.totalReactionsCount}{" "}
          {message.totalReactionsCount === 1 ? "reaction" : "reactions"}
        </h2>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-64 py-2 custom-scrollbar overflow-x-hidden">
        <AnimatePresence initial={false}>
          {message.reactions?.map((reaction) => {
            const isMe = reaction.profileId === user.userId;
            const profilePicUrl = reaction.profilePicture?.startsWith("http")
              ? reaction.profilePicture
              : `${BASE_URL}${reaction.profilePicture}`;

            return (
              <motion.div
                key={reaction.profileId}
                layout 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  if (isMe)
                    react({
                      messageId: message.messageId,
                      emoji: reaction.emoji,
                    });
                }}
                className={`flex items-center gap-3 px-4 py-2 transition-colors overflow-hidden ${
                  isMe
                    ? "cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-200 dark:bg-slate-700">
                  {reaction.profilePicture ? (
                    <img
                      src={profilePicUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 font-bold">
                      {reaction.senderName?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100 truncate">
                    {isMe ? "You" : reaction.senderName}
                  </span>
                  {isMe && (
                    <span className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Click to remove
                    </span>
                  )}
                </div>

                <span
                  className="text-[20px] shrink-0"
                  style={{ fontFamily: "var(--emoji-font)" }}
                >
                  {reaction.emoji}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
