import { useEffect, useRef, useState } from "react";
import { X, Heart, MoreHorizontal, Flag } from "lucide-react";
import * as commentApi from "../components/services/commentApi";
import { normalizeMediaUrl } from "./services/posts.api";
import { useNavigate } from "react-router-dom";
import { ReportModal } from "../../reports/components/ReportModal";
import Skeleton from "react-loading-skeleton";
import MyEmojiPicker from "../../chat/components/EmojiPicker";
import { HiOutlineFaceSmile } from "react-icons/hi2";
import { LikesList } from "./LikesList";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
type CommentItem = {
  commentId: string;
  profileId: string;
  userName: string;
  profilePicture: string;
  description: string;
  createdDate: string;
  likesCount: number;
  repliesCount: number;
  isLikedByCurrentUser: boolean;
};

type ReplyItem = {
  replyId: string;
  profileId: string;
  userName: string;
  profilePicture: string;
  description: string;
  createdDate: string;
  likesCount: number;
  repliesCount: number;
  isLikedByCurrentUser: boolean;
};

type CommentsModalProps = {
  open: boolean;
  onClose: () => void;
  postId: string;
  currentUserId: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

export function CommentsModal({
  open,
  onClose,
  postId,
  currentUserId,
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [likesModal, setLikesModal] = useState<{
    open: boolean;
    id?: string;
    type?: "comment" | "reply";
  }>({
    open: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const [menuOpenMap, setMenuOpenMap] = useState<Record<string, boolean>>({});
  const [repliesMap, setRepliesMap] = useState<Record<string, ReplyItem[]>>({});
  const [repliesOpenMap, setRepliesOpenMap] = useState<Record<string, boolean>>(
    {},
  );
  const [isReportOpen, setIsReportOpen] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showReplyEmoji, setShowReplyEmoji] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);

  function handleEmojiSelect(emoji: string) {
    setReplyText((text) => text + emoji);
  }

  function handleEmojiSelectComment(emoji: string) {
    setNewComment((text) => text + emoji);
  }

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentApi.fetchComments(postId);
      setComments(data.data.items || []);
    } catch (err) {
      toast.error("Failed to fetch comments: " + err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (parentId: string) => {
    try {
      const data = await commentApi.fetchReplies(parentId);
      setRepliesMap((prev) => ({ ...prev, [parentId]: data.data.items || [] }));
    } catch (err) {
      toast.error("Failed to fetch replies: " + err);
      setRepliesMap((prev) => ({ ...prev, [parentId]: [] }));
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string }) =>
      commentApi.createComment(currentUserId, postId, text, parentId),

    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      if (variables.parentId) {
        setReplyText("");
        setReplyingTo(null);
        setReplyingToName(null);
        setRepliesOpenMap((prev) => ({ ...prev, [variables.parentId!]: true }));
        await fetchReplies(variables.parentId);
      } else {
        setNewComment("");
        await fetchComments();
      }

      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });
  const [actionType, setActionType] = useState<"comment" | "reply" | null>(
    null,
  );
  const handleAddComment = (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    setActionType(parentId ? "reply" : "comment");

    addCommentMutation.mutate(
      {
        text: text.trim(),
        parentId,
      },
      {
        onSettled: () => {
          setActionType(null);
        },
      },
    );
  };
  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;
    await commentApi.editComment(id, editText.trim());

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
    queryClient.invalidateQueries({
      queryKey: ["comments", postId],
    });

    setEditingId(null);
    fetchComments();
    Object.keys(repliesMap).forEach((parentId) => fetchReplies(parentId));
  };

  const handleDelete = async (id: string, parentId?: string) => {
    await commentApi.deleteComment(id);

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });

    if (parentId) {
      setRepliesMap((prev) => ({
        ...prev,
        [parentId]: prev[parentId]?.filter((r) => r.replyId !== id) || [],
      }));
    } else {
      fetchComments();
    }
  };

  const queryClient = useQueryClient();

  const handleLike = async (commentId: string, parentId?: string) => {
    if (parentId) {
      setRepliesMap((prev) => ({
        ...prev,
        [parentId]: prev[parentId]?.map((reply) =>
          reply.replyId === commentId
            ? {
                ...reply,
                isLikedByCurrentUser: !reply.isLikedByCurrentUser,
                likesCount: reply.isLikedByCurrentUser
                  ? reply.likesCount - 1
                  : reply.likesCount + 1,
              }
            : reply,
        ),
      }));
    } else {
      setComments((prev) =>
        prev.map((comment) =>
          comment.commentId === commentId
            ? {
                ...comment,
                isLikedByCurrentUser: !comment.isLikedByCurrentUser,
                likesCount: comment.isLikedByCurrentUser
                  ? comment.likesCount - 1
                  : comment.likesCount + 1,
              }
            : comment,
        ),
      );
    }

    try {
      await commentApi.likeComment(currentUserId, commentId);
      queryClient.invalidateQueries({
        queryKey: ["likes", "comment", commentId],
      });
    } catch (error) {
      toast.error("Failed to like comment: " + error);
      if (parentId) fetchReplies(parentId);
    }
  };

  const toggleMenu = (key: string) => {
    setMenuOpenMap((prev) => (prev[key] ? {} : { [key]: true }));
  };

  const closeAllMenus = () => setMenuOpenMap({});

  const toggleReplies = async (commentId: string) => {
    const isOpen = !!repliesOpenMap[commentId];
    if (isOpen) {
      setRepliesOpenMap((prev) => ({ ...prev, [commentId]: false }));
      return;
    }
    setRepliesOpenMap((prev) => ({ ...prev, [commentId]: true }));
    if (!repliesMap[commentId]) {
      await fetchReplies(commentId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-container")) closeAllMenus();
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) fetchComments();
  }, [open, postId]);

  useEffect(() => {
    if (!open) {
      setReplyingTo(null);
      setReplyingToName(null);
      setEditingId(null);
      setMenuOpenMap({});
      setRepliesMap({});
      setRepliesOpenMap({});
    }
  }, [open]);

  if (!open) return null;

  const renderComment = (
    comment: CommentItem | ReplyItem,
    parentId?: string,
  ) => {
    const isReply = !!parentId;
    const id = isReply
      ? (comment as ReplyItem).replyId
      : (comment as CommentItem).commentId;

    const menuKey = `${isReply ? "r" : "c"}-${id}`;

    const renderWithMentions = (text: string) => {
      const HIDDEN = "\u200B";
      const regex = new RegExp(`@[^${HIDDEN}]+${HIDDEN}`, "g");
      const parts = text.split(regex);
      const matches = text.match(regex) || [];

      const result: React.ReactNode[] = [];

      parts.forEach((part, index) => {
        result.push(<span key={`text-${index}`}>{part}</span>);

        if (matches[index]) {
          result.push(
            <span
              key={`mention-${index}`}
              className="text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              {matches[index]}
            </span>,
          );
        }
      });

      return result;
    };

    return (
      <div key={id} className="flex gap-3 w-full">
        <img
          src={
            normalizeMediaUrl(comment.profilePicture) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}`
          }
          className={`${
            isReply ? "w-7 h-7" : "w-9 h-9"
          } rounded-full object-cover mt-0.5 flex-shrink-0 border border-slate-100 dark:border-slate-700`}
          alt="avatar"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              {editingId === id ? (
                <div className="flex gap-2 flex-wrap w-full">
                  <input
                    className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button
                    onClick={() => handleEdit(id)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full bg-slate-900 dark:bg-indigo-600 text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl">
                  <div className="text-sm leading-5 break-words">
                    <span
                      onClick={() => navigate(`/profile/${comment.profileId}`)}
                      className="font-semibold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {comment.userName}
                    </span>
                    <p className="rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 px-3 py-2 mt-1 text-slate-800 dark:text-slate-200">
                      {renderWithMentions(comment.description)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating 3 dots menu */}
            <div className="relative menu-container flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(menuKey);
                }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 z-50 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {isReportOpen && (
                <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
                  <ReportModal
                    entityType="comment"
                    entityId={id}
                    profileId={currentUserId}
                    onClose={() => setIsReportOpen(false)}
                  />
                </div>
              )}
              {menuOpenMap[menuKey] && (
                <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg w-36 overflow-hidden">
                  <div className="flex flex-col">
                    {comment.profileId === currentUserId ? (
                      <>
                        <button
                          className="w-full px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-left transition-colors"
                          onClick={() => {
                            setEditingId(id);
                            setEditText(comment.description);
                            closeAllMenus();
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="w-full px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-500/10 text-left text-red-500 dark:text-red-400 transition-colors"
                          onClick={() => handleDelete(id, parentId)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        onClick={() => {
                          toggleMenu(menuKey);
                          setIsReportOpen(true);
                        }}
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span>{formatDate(comment.createdDate)}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleLike(id, parentId)}
                className="flex items-center gap-1 group"
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    (
                      isReply
                        ? (comment as ReplyItem).isLikedByCurrentUser
                        : (comment as CommentItem).isLikedByCurrentUser
                    )
                      ? "text-indigo-600 fill-indigo-600 scale-110"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600"
                  }`}
                />
              </button>
              <span
                onClick={() =>
                  setLikesModal({
                    open: true,
                    id: isReply
                      ? (comment as ReplyItem).replyId
                      : (comment as CommentItem).commentId,
                    type: "comment",
                  })
                }
                className="text-xs font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200"
              >
                {isReply
                  ? (comment as ReplyItem).likesCount
                  : (comment as CommentItem).likesCount}
              </span>
            </div>

            {likesModal.open && likesModal.id && (
              <div
                className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setLikesModal({ open: false });
                }}
              >
                <div
                  className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-lg p-5 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      setLikesModal({
                        open: false,
                      })
                    }
                    className="absolute top-3 right-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    ✕
                  </button>

                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Likes
                  </h3>

                  <LikesList type="comment" id={likesModal.id} />
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const mainParentId = parentId ?? id;
                const isReplyingToSelf = comment.profileId === currentUserId;

                setReplyingTo(mainParentId);
                setReplyingToName(comment.userName);

                if (!isReplyingToSelf) {
                  const HIDDEN = "\u200B";
                  const mention = `@${comment.userName}${HIDDEN}`;
                  setReplyText((prev) =>
                    prev.startsWith(mention) ? prev : mention,
                  );
                } else {
                  setReplyText("");
                }

                setRepliesOpenMap((prev) => ({
                  ...prev,
                  [mainParentId]: true,
                }));
              }}
              className="font-medium hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Reply
            </button>
          </div>

          {!isReply && comment.repliesCount > 0 && (
            <div className="mt-2">
              <button
                onClick={() => toggleReplies(id)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-2 transition-colors"
              >
                <span className="h-px w-8 bg-slate-300 dark:bg-slate-600" />
                {repliesOpenMap[id]
                  ? "Hide replies"
                  : `View ${comment.repliesCount} replies`}
              </button>
            </div>
          )}

          {!isReply && repliesOpenMap[id] && (
            <div className="mt-2 flex gap-3 w-full">
              <div className="w-9 flex justify-center">
                <div className="relative w-px bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                {!repliesMap[id] ? (
                  <div className="text-xs text-slate-500 py-2"></div>
                ) : repliesMap[id].length === 0 ? (
                  <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    No replies yet
                  </div>
                ) : (
                  repliesMap[id].map((r) => renderComment(r, id))
                )}
              </div>
            </div>
          )}

          {replyingTo === (parentId ?? id) && !parentId && (
            <div className="mt-3 w-full">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Replying to{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  @{replyingToName}
                </span>
              </div>

              <div className="relative flex flex-col gap-2 w-full">
                {/* Row 1: Emoji button + Input */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyEmoji((prev) => !prev);
                      setShowCommentEmoji(false);
                    }}
                    className="flex-shrink-0 cursor-pointer transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full"
                  >
                    <HiOutlineFaceSmile className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700 dark:text-slate-300" />
                  </button>

                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>

                {/* Row 2: Action buttons (right-aligned) */}
  <div className="flex items-center justify-end gap-1.5 pl-8">
    <button
      onClick={() => {
        setReplyingTo(null);
        setReplyingToName(null);
        setReplyText("");
      }}
      className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
    >
      Cancel
    </button>

    <button
      onClick={() => handleAddComment(id)}
      disabled={!replyText.trim() || addCommentMutation.isPending}
      className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
        replyText.trim()
          ? "text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
          : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
      }`}
    >
      {addCommentMutation.isPending && actionType === "reply"
        ? "Replying..."
        : "Reply"}
    </button>
  </div>

                {/* Emoji Picker */}
                {showReplyEmoji && (
                  <div
                    className="absolute left-0 bottom-full mb-2 z-50"
                    onClick={() => setShowReplyEmoji(false)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <MyEmojiPicker
                        onSelect={handleEmojiSelect}
                        width={300}
                        height={320}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-slate-900/80 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-1/2 w-[94%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden border border-transparent dark:border-slate-700/50">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
          <div className="w-8" />
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            Comments
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
          {loading ? (
            <div className="space-y-4 dark:opacity-60 transition-opacity">
              <Skeleton height={20} width={200} />
              <Skeleton height={15} count={3} />
              <Skeleton height={200} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400">
              No comments yet
            </div>
          ) : (
            comments.map((c) => renderComment(c))
          )}
          <div ref={commentsEndRef} />
        </div>

        <div className="relative w-full border-t border-slate-100 dark:border-slate-700/50 px-4 py-3 flex gap-3 items-center bg-white dark:bg-slate-800 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowCommentEmoji((prev) => !prev);
              setShowReplyEmoji(false);
            }}
            className="cursor-pointer transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full"
          >
            <HiOutlineFaceSmile className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </button>

          {showCommentEmoji && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-start"
              onClick={() => setShowCommentEmoji(false)}
            >
              <div className="ml-6 mb-24" onClick={(e) => e.stopPropagation()}>
                <MyEmojiPicker onSelect={handleEmojiSelectComment} />
              </div>
            </div>
          )}
          <input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
          />

          <button
            onClick={() => handleAddComment()}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
              newComment.trim()
                ? "text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            {addCommentMutation.isPending && actionType === "comment"
              ? "Adding..."
              : "Add"}{" "}
          </button>
        </div>
      </div>
    </div>
  );
}
