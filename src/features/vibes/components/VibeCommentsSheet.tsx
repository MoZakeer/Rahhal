import { useEffect, useState } from "react";
import { Send, X, Trash2, Loader2, Heart, Pencil, Check } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  addComment,
  fetchVibeComments,
  deleteComment,
  addLikeToComment,
  updateComment,
} from "../services/vibesApi";

import type { Vibe, VibeComment } from "../data/vibesData";

import { normalizeMediaUrl } from "@/features/post/components/services/posts.api";
import Skeleton from "react-loading-skeleton";
import { LikesList } from "@/features/post/components/LikesList";

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
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openLikes, setOpenLikes] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [bumps, setBumps] = useState<Record<string, number>>({});
  const [likingIds, setLikingIds] = useState<Record<string, boolean>>({});

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
  // HELPERS
  // -------------------
  const updateLocalComment = (
    commentId: string,
    updater: (comment: VibeComment) => VibeComment,
  ) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.commentId === commentId ? updater(comment) : comment,
      ),
    );
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

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
  // DELETE COMMENT
  // -------------------
  const handleDelete = async (commentId: string) => {
    if (deletingId) return;

    setDeletingId(commentId);

    try {
      await deleteComment(commentId);

      setComments((prev) => prev.filter((c) => c.commentId !== commentId));
    } catch (err) {
      console.error("Failed to delete comment", err);
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------
  // EDIT COMMENT
  // -------------------
  const startEditing = (comment: VibeComment) => {
    setEditingId(comment.commentId);
    setEditText(comment.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleEditSave = async (commentId: string) => {
    const trimmed = editText.trim();

    if (!trimmed) return;

    setSavingEdit(true);

    const oldComment = comments.find((c) => c.commentId === commentId);

    if (!oldComment) return;

    // Optimistic update
    updateLocalComment(commentId, (comment) => ({
      ...comment,
      description: trimmed,
    }));

    try {
      await updateComment(commentId, trimmed);

      setEditingId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to update comment", err);

      // rollback
      updateLocalComment(commentId, (comment) => ({
        ...comment,
        description: oldComment.description,
      }));
    } finally {
      setSavingEdit(false);
    }
  };

  // -------------------
  // LIKE COMMENT
  // -------------------
  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId || likingIds[commentId]) return;

    const currentComment = comments.find((c) => c.commentId === commentId);
    if (!currentComment) return;

    const nextLiked = !currentComment.isLikedByCurrentUser;

    // Optimistic update
    setLikingIds((prev) => ({ ...prev, [commentId]: true }));
    setBumps((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
    updateLocalComment(commentId, (comment) => ({
      ...comment,
      isLikedByCurrentUser: nextLiked,
      likesCount: nextLiked
        ? comment.likesCount + 1
        : Math.max(0, comment.likesCount - 1),
    }));

    try {
      await addLikeToComment(currentUserId, commentId);
    } catch (err) {
      console.error("Failed to toggle comment like:", err);
    } finally {
      await loadComments(); // ✅ always sync — even if API "errors", data was saved
      setLikingIds((prev) => ({ ...prev, [commentId]: false }));
    }
  };
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

          {/* COMMENTS */}
          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
            {loading && (
              <div className="flex justify-center py-10">
                <Skeleton count={3} />
              </div>
            )}

            {!loading &&
              comments.map((c) => {
                const isOwner = currentUserId && c.profileId === currentUserId;

                const isDeleting = deletingId === c.commentId;

                const isLiking = likingIds[c.commentId];

                const commentBump = bumps[c.commentId] || 0;

                const isEditing = editingId === c.commentId;

                return (
                  <motion.div
                    key={c.commentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="group flex items-start justify-between gap-3"
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <Avatar
                        onClick={() => navigate(`/profile/${c.profileId}`)}
                        className="h-8 w-8 shrink-0 border border-border/20 shadow-sm cursor-pointer transition-opacity hover:opacity-90"
                      >
                        <AvatarImage
                          src={normalizeMediaUrl(c.profilePicture)}
                          alt={c.userName}
                        />

                        <AvatarFallback className="bg-primary/5 text-[11px] font-medium text-primary">
                          {initials(c.userName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        {/* TOP BAR */}
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <button
                            onClick={() => navigate(`/profile/${c.profileId}`)}
                            className="truncate text-xs font-semibold text-foreground/90 hover:text-foreground"
                          >
                            {c.userName}
                          </button>
                          {isOwner && !isEditing && (
                            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              {/* EDIT */}
                              <button
                                onClick={() => startEditing(c)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground transition-all hover:scale-105 hover:border-blue-500/40 hover:bg-blue/10 hover:text-blue-500"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              {/* DELETE */}
                              <button
                                disabled={isDeleting}
                                onClick={() => handleDelete(c.commentId)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background/80 text-muted-foreground transition-all hover:scale-105 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* COMMENT BUBBLE */}
                        <div className="rounded-2xl border border-border/40 bg-muted/40 px-3.5 py-3 shadow-sm transition-colors hover:bg-muted/55">
                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                rows={3}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full resize-none rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                              />

                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={cancelEditing}
                                  disabled={savingEdit}
                                  className="rounded-xl"
                                >
                                  Cancel
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={savingEdit || !editText.trim()}
                                  onClick={() => handleEditSave(c.commentId)}
                                  className="rounded-xl"
                                >
                                  {savingEdit ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="mr-1 h-4 w-4" />
                                      Save
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/85">
                              {c.description}
                            </p>
                          )}
                        </div>

                        {/* FOOTER */}
                        <div className="mt-1.5 flex items-center gap-3 px-1">
                          <p className="text-[10px] font-medium tracking-wide text-muted-foreground/70">
                            {new Date(c.createdDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>

                          {c.likesCount > 0 && (
                            <p
                              onClick={() => setOpenLikes(true)}
                              className="text-[10px] font-semibold text-muted-foreground/90 cursor-pointer hover:text-muted-foreground/100 transition-colors"
                            >
                              {c.likesCount}{" "}
                              {c.likesCount === 1 ? "like" : "likes"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {openLikes && (
                      <div
                        onClick={() => setOpenLikes(false)}
                        className="fixed inset-0 bg-black/10 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                      >
                        <div
                          className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-lg p-5 relative border border-transparent dark:border-slate-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setOpenLikes(false)}
                            className="absolute top-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors right-3 text-lg font-bold"
                          >
                            ✕
                          </button>

                          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                            {"Liked by " +
                              vibe.likes +
                              " " +
                              (vibe.likes === 1 ? "person" : "people")}
                          </h3>

                          <LikesList type="post" id={vibe.id} />
                        </div>
                      </div>
                    )}
                    {/* LIKE */}
                    {!isEditing && (
                      <button
                        type="button"
                        disabled={!currentUserId || isLiking}
                        onClick={() => handleLikeComment(c.commentId)}
                        className="mt-8 shrink-0 rounded-full p-2  hover:bg-muted active:scale-75 "
                      >
                        <motion.div
                          key={commentBump}
                          animate={
                            commentBump > 0 ? { scale: [1, 1.35, 0.9, 1] } : {}
                          }
                          transition={{
                            duration: 0.01,
                            ease: "easeInOut",
                          }}
                        >
                          <Heart
                            className={`h-4 w-4  ${
                              c.isLikedByCurrentUser
                                ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                                : "text-muted-foreground/50 hover:text-foreground"
                            }`}
                          />
                        </motion.div>
                      </button>
                    )}
                  </motion.div>
                );
              })}
          </div>

          {/* INPUT */}
          <div className="border-t border-border/60 bg-card/80 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-muted/40 p-1 pl-3">
              <Input
                placeholder={
                  currentUserId ? "Add a comment…" : "Sign in to comment"
                }
                value={text}
                disabled={!currentUserId || sending}
                onChange={(e) => setText(e.target.value)}
                className="h-9 flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
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
                className="h-9 w-9 rounded-xl"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
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
