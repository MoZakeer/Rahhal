import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

import { toggleReaction } from "../services/vibesApi";

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
  const [liked, setLiked] = useState(vibe.isLiked);

  const [bump, setBump] = useState(0);

  // -------------------
  // LIKE
  // -------------------

  const handleReact = async () => {
    const next = !liked;

    // optimistic update
    setLiked(next);

    setBump((b) => b + 1);

    try {
      await toggleReaction(vibe.id);
    } catch (err) {
      console.error("Failed to like vibe", err);

      // rollback
      setLiked(!next);
    }
  };

  return (
    <div className="relative z-10 border-t border-white/5 bg-zinc-950/40 p-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* LIKE BUTTON */}
        <button
          type="button"
          onClick={handleReact}
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
          aria-label={liked ? "Unlike" : "Like"}
        >
          <motion.div
            key={bump}
            animate={bump ? { scale: [1, 1.25, 0.95, 1] } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Heart
              className={`h-5 w-5 transition-all duration-300 group-hover:scale-105 ${
                liked
                  ? "fill-red-500 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                  : "text-zinc-300 group-hover:text-white"
              }`}
            />
          </motion.div>
        </button>

        {/* COMMENTS BUTTON */}
        <button
          type="button"
          onClick={() => {
            onPause?.();
            onOpenComments();
          }}
          className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Open comments"
        >
          <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
        </button>
      </div>
    </div>
  );
};

export default VibeReactionsBar;
