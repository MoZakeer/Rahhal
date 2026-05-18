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
  const [liked, setLiked] = useState(
    vibe.isLiked,
  );

  const [likes, setLikes] = useState(
    vibe.likes,
  );

  const [bump, setBump] = useState(0);

  // -------------------
  // LIKE
  // -------------------

  const handleReact = async () => {
    const next = !liked;

    // optimistic update
    setLiked(next);

    setLikes((c) =>
      next ? c + 1 : c - 1,
    );

    setBump((b) => b + 1);

    try {
      await toggleReaction(vibe.id);
    } catch (err) {
      console.error(
        "Failed to like vibe",
        err,
      );

      // rollback
      setLiked(!next);

      setLikes((c) =>
        next ? c - 1 : c + 1,
      );
    }
  };

  return (
    <div className="relative z-10 border-t border-white/10 bg-black/60 p-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* LIKE */}

        <button
          type="button"
          onClick={handleReact}
          onMouseEnter={onPause}
          onMouseLeave={onResume}
          className="flex items-center gap-1.5 text-white"
        >
          <motion.span
            key={bump}
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 0.35,
            }}
          >
            <Heart
              className={`h-6 w-6 transition-colors ${
                liked
                  ? "fill-red-500 text-red-500"
                  : "text-white"
              }`}
            />
          </motion.span>

          <span className="text-sm font-medium">
            {likes}
          </span>
        </button>

        {/* COMMENTS */}

        <button
          type="button"
          onClick={() => {
            onPause?.();
            onOpenComments();
          }}
          className="flex items-center gap-1.5 text-white"
        >
          <MessageCircle className="h-6 w-6" />

          <span className="text-sm font-medium">
            {vibe.commentsCount}
          </span>
        </button>
      </div>
    </div>
  );
};

export default VibeReactionsBar;