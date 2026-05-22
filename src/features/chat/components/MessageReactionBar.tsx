import { motion } from "framer-motion";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

type Props = {
  onReact: (emoji: string) => void;
  currentReaction?: string | null;
};

function MessageReactionBar({ onReact, currentReaction }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 6,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 6,
        scale: 0.98,
      }}
      transition={{
        duration: 0.12,
      }}
      className="
        flex items-center
        gap-1.5
        px-2.5 py-1
        rounded-full
        bg-gray-0 dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        shadow-md
      "
    >
      {QUICK_REACTIONS.map((emoji) => {
        const isSelected = emoji === currentReaction;
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={`
          flex items-center justify-center
          w-8 h-8
          rounded-full
          text-[20px]
          leading-none
          transition-colors duration-150
          ${
            isSelected
              ? "bg-primary-100 dark:bg-primary-500/40  ring-2 ring-primary-500/50"
              : "hover:bg-black/6 dark:hover:bg-white/6"
          }
          `}
            style={{
              fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", sans-serif',
            }}
          >
            {emoji}
          </button>
        );
      })}
    </motion.div>
  );
}

export default MessageReactionBar;
