import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toggleReaction } from"../services/vibesApi";
import type { Vibe } from "../data/vibesData";

interface VibeReactionsBarProps {
  vibe: Vibe;
  onOpenComments: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

const VibeReactionsBar = ({
  vibe,
  onOpenComments,
  onPause,
  onResume,
}: VibeReactionsBarProps) => {
  const [reacted, setReacted] = useState(vibe.reactions.userReacted);
  const [count, setCount] = useState(vibe.reactions.count);
  const [bump, setBump] = useState(0);

  const handleReact = async () => {
    // optimistic
    const next = !reacted;
    setReacted(next);
    setCount((c) => c + (next ? 1 : -1));
    setBump((b) => b + 1);
    try {
      await toggleReaction(vibe.id);
    } catch {
      setReacted(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  };

  const latest = vibe.latestComment;

  return (
    <div className="relative z-10 border-t border-white/10 bg-black/60 p-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleReact}
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          className="flex items-center gap-1.5 text-white"
          aria-label="Love"
        >
          <motion.span
            key={bump}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.35 }}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                reacted ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
          </motion.span>
          <span className="text-sm font-medium">{count}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onPause?.();
            onOpenComments();
          }}
          className="flex items-center gap-1.5 text-white"
          aria-label="Comments"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-sm font-medium">{vibe.commentsCount}</span>
        </button>
      </div>

      {latest && (
        <button
          type="button"
          onClick={() => {
            onPause?.();
            onOpenComments();
          }}
          className="mt-2 flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-left transition hover:bg-white/15"
        >
          <span className="text-xs font-semibold text-white">
            {latest.userName.split(" ")[0]}:
          </span>
          <span className="line-clamp-1 text-xs text-white/80">{latest.text}</span>
        </button>
      )}
    </div>
  );
};

export default VibeReactionsBar;
