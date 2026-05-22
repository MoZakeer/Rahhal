import { ArrowRight, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

import type { Vibe } from "../data/vibesData";

interface VibeReactionsBarProps {
  vibe: Vibe;
  onOpenComments: () => void;
  onToggleLike: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

const VibeReactionsBar = ({
  vibe,
  onOpenComments,
  onToggleLike,
  onPause,
  onResume,
}: VibeReactionsBarProps) => {
  return (
    <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pb-8 pt-12 pointer-events-none">
      {/* Flex layout distributes interactions cleanly across the bottom bar */}
      <div className="flex items-center justify-between gap-4 pointer-events-auto">
        {/* LEFT SIDE: ENGAGEMENT ACTIONS (LIKES & COMMENTS) */}
        <div className="flex items-center gap-4">
          {/* LIKE BUTTON CONTAINER */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleLike}
              onMouseEnter={onPause}
              onMouseLeave={onResume}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-90 border border-white/5"
              aria-label={vibe.isLiked ? "Unlike" : "Like"}
            >
              <motion.div
                animate={vibe.isLiked ? { scale: [1, 1.3, 0.9, 1] } : {}}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <Heart
                  className={`h-5 w-5 transition-colors duration-200 ${
                    vibe.isLiked
                      ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                      : "text-white/90 group-hover:text-white"
                  }`}
                />
              </motion.div>
            </button>
          </div>

          {/* COMMENTS BUTTON CONTAINER */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onPause?.();
                onOpenComments();
              }}
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:text-white active:scale-90 border border-white/5"
              aria-label="Open comments"
            >
              <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: VIEW TRIP CONTEXT BUTTON */}
        {/* Pass your router function or link redirection handler to onClick */}
        <button
          type="button"
          onClick={() => {
            onPause?.();
            window.location.href = `/trip/${vibe.tripId}`;
          }}
          className="group flex h-10 items-center gap-1.5 rounded-full bg-white/15 px-4 text-xs font-semibold text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:bg-white/25 active:scale-95 shadow-sm"
        >
          <span>View Trip</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};

export default VibeReactionsBar;
