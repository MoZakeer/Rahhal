import { useEffect, useState } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { addComment, fetchVibeComments } from "../services/vibesApi";

import type { Vibe, VibeComment } from "../data/vibesData";

import { normalizeMediaUrl } from "@/features/post/components/services/posts.api";

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
  const loadComments = async () => {
    try {
      const data = await fetchVibeComments(vibe.id);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  useEffect(() => {
    setLoading(true);

    loadComments().finally(() => {
      setLoading(false);
    });
  }, [vibe.id]);

  // -------------------
  // SEND COMMENT
  // -------------------
  const handleSend = async () => {
    const trimmed = text.trim();

    if (!trimmed || !currentUserId) return;

    setSending(true);

    try {
      await addComment({
        profileId: currentUserId,
        postId: vibe.id,
        description: trimmed,
      });

      await loadComments();

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
  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 220,
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[80vh] w-full max-w-md flex-col rounded-t-2xl border border-border/40 bg-card shadow-2xl md:h-[70vh] md:rounded-2xl"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
            <div>
              <h3 className="font-sans text-base font-semibold tracking-tight">
                Comments
              </h3>

              <p className="text-xs text-muted-foreground">
                {comments.length} interactions
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* COMMENTS LIST */}
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
            {/* LOADING */}
            {loading && (
              <div className="animate-fade-in space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full border border-border/10 bg-muted/60" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="max-w-[85%] space-y-2 rounded-2xl bg-muted/40 px-4 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-muted-foreground/20" />

                        <div className="h-3.5 w-full animate-pulse rounded bg-muted-foreground/15" />

                        <div className="h-3.5 w-[75%] animate-pulse rounded bg-muted-foreground/15" />
                      </div>

                      <div className="ml-1 h-2 w-12 animate-pulse rounded bg-muted-foreground/10" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && comments.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-muted-foreground/80">
                  No comments yet
                </p>

                <p className="text-xs text-muted-foreground/60">
                  Start the conversation below.
                </p>
              </div>
            )}

            {/* COMMENTS */}
            <AnimatePresence initial={false}>
              {!loading &&
                comments.map((c) => (
                  <motion.div
                    key={c.commentId}
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.95,
                    }}
                    className="flex items-start gap-3"
                  >
                    <div className="flex w-full min-w-0 items-start gap-3">
                      {/* AVATAR */}
                      <Avatar className="h-8 w-8 shrink-0 border border-border/20 shadow-sm">
                        <AvatarImage
                          src={normalizeMediaUrl(c.profilePicture)}
                          alt={c.userName}
                        />

                        <AvatarFallback className="bg-primary/5 text-[11px] font-medium text-primary">
                          {initials(c.userName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* COMMENT CONTENT */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div>
                          <div className="rounded-2xl bg-muted/50 px-3.5 py-2 transition-colors hover:bg-muted/70">
                            <p className="text-xs font-semibold text-foreground/90">
                              {c.userName}
                            </p>

                            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                              {c.description}
                            </p>
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex items-center gap-3 px-1">
                          <p className="text-[10px] font-medium tracking-wide text-muted-foreground/70">
                            {new Date(c.createdDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>

          {/* INPUT FOOTER */}
          <div className="border-t border-border/60 bg-card/80 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 p-1 pl-3 transition-within:border-primary/40 transition-within:ring-1 transition-within:ring-primary/20">
              <Input
                placeholder={
                  currentUserId ? "Add a comment…" : "Sign in to comment"
                }
                value={text}
                disabled={!currentUserId || sending}
                onChange={(e) => setText(e.target.value)}
                className="h-9 flex-1 border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <Button
                size="icon"
                variant={text.trim() ? "default" : "ghost"}
                onClick={handleSend}
                disabled={sending || !text.trim() || !currentUserId}
                className="h-8 w-8 shrink-0 rounded-lg transition-all duration-200"
              >
                {sending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VibeCommentsSheet;
