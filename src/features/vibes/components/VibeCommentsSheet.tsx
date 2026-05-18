import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { addComment, fetchVibeComments } from "../services/vibesApi";

import type { Vibe, VibeComment } from "../data/vibesData";

interface VibeCommentsSheetProps {
  vibe: Vibe;
  currentUserId: string | null;
  onClose: () => void;
}

const VibeCommentsSheet = ({
  vibe,
  currentUserId,
  onClose,
}: VibeCommentsSheetProps) => {
  const [comments, setComments] = useState<VibeComment[]>([]);

  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");

  const [sending, setSending] = useState(false);

  // -------------------
  // FETCH COMMENTS
  // -------------------

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await fetchVibeComments(vibe.id);

        setComments(data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [vibe.id]);

  // -------------------
  // SEND COMMENT
  // -------------------

  const handleSend = async () => {
    const t = text.trim();

    if (!t || !currentUserId) return;

    setSending(true);

    try {
      await addComment({
        profileId: currentUserId,
        postId: vibe.id,
        description: t,
      });

      const refreshed = await fetchVibeComments(vibe.id);

      setComments(refreshed);

      setText("");
    } catch (err) {
      console.error("Failed to send comment", err);
    } finally {
      setSending(false);
    }
  };

  // -------------------
  // HELPERS
  // -------------------

  const initials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // -------------------
  // UI
  // -------------------

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[70vh] w-full max-w-md flex-col rounded-t-2xl bg-card shadow-elevated md:mb-8 md:rounded-2xl"
        >
          {/* HEADER */}

          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-display text-base font-semibold">
              Comments ({comments.length})
            </h3>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* COMMENTS */}

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {loading && (
              <p className="text-center text-sm text-muted-foreground">
                Loading comments...
              </p>
            )}

            {!loading && comments.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Be the first to comment.
              </p>
            )}

            {comments.map((c) => (
              <div key={c.commentId} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.profilePicture} alt={c.userName} />

                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {initials(c.userName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl bg-muted/60 px-3 py-2">
                    <p className="text-xs font-semibold">{c.userName}</p>

                    <p className="text-sm text-foreground/90">
                      {c.description}
                    </p>
                  </div>

                  <p className="mt-1 px-3 text-[11px] text-muted-foreground">
                    {new Date(c.createdDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT */}

          <div className="flex items-center gap-2 border-t p-3">
            <Input
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();

                  handleSend();
                }
              }}
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={sending || !text.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VibeCommentsSheet;
