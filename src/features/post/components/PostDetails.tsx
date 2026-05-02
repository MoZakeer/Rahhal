import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

// Types
import type { PostDetails } from "../../../types/post";
import type { PostMediaItem } from "../../../types/post";

// Components & Services
import { LikesList } from "./LikesList";
import { getUserId } from "../../../utils/auth";
import { PostContent } from "./PostContent";
import { getPostById } from "../components/services/posts.api";
import EditPostModal from "../components/EditPostModal";
import ConfirmModal from "../../ReportDetals/components/confirmModal";
import { normalizeMediaUrl } from "./services/posts.api";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  GlobeIcon,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Bookmark } from "lucide-react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { ReportModal } from "../../reports/components/ReportModal";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useEffect } from "react";
// The New Hook
import { usePostDetailsActions } from "./hooks/usePostDetails";
import { Heart } from "lucide-react";
import * as commentApi from "../components/services/commentApi";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import MyEmojiPicker from "../../chat/components/EmojiPicker";
import { HiOutlineFaceSmile } from "react-icons/hi2";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";

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
export function PostHeader({
  id,
  userName,
  profileUrl,
  profileId,
  currentUserId,
  isFollowed,
  createdAt,
  onEdit,
  onDelete,
  onFollow,
}: {
  id: string;
  userName: string;
  profileUrl: string;
  profileId: string;
  currentUserId: string;
  isFollowed?: boolean;
  createdAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onFollow?: () => void;
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwner = currentUserId === profileId;
  profileUrl =
    profileUrl ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
  const [isReportOpen, setIsReportOpen] = useState(false);

  function formatTime(date?: string) {
    if (!date) return "";

    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return created.toLocaleDateString();
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 relative">
      <div className="flex items-center gap-3">
        <img
          src={normalizeMediaUrl(profileUrl)}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span
            onClick={() => navigate(`/profile/${profileId}`)}
            className="font-semibold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {userName}
          </span>
          {createdAt && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
              {formatTime(createdAt)} <GlobeIcon className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isOwner && (
          <button
            onClick={onFollow}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
              isFollowed
                ? "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                : "bg-blue-700 dark:bg-blue-700 border border-blue-700 dark:border-blue-900 text-white hover:bg-blue-800 dark:hover:bg-blue-900"
            }`}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {isReportOpen && (
            <div className="fixed inset-0  flex items-center justify-center z-50">
              <ReportModal
                entityType="post"
                entityId={id}
                onClose={() => setIsReportOpen(false)}
              />
            </div>
          )}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden translate-x-3 border border-transparent dark:border-slate-700">
              {isOwner ? (
                <>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={onEdit}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    setIsReportOpen(true);
                  }}
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export function PostMedia({ media }: { media: PostMediaItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  if (!media.length) return null;

  const next = () => {
    setCurrent((prev) => (prev + 1) % media.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  // Drag Start
  const handleStart = (x: number) => {
    startX.current = x;
    isDragging.current = true;
  };

  const handleEnd = () => {
    isDragging.current = false;
    startX.current = null;
  };

  return (
    <div className="w-full">
      {/* Main Image (Swipe Area) */}
      <div
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group select-none bg-slate-100 dark:bg-slate-900 cursor-pointer"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {media.length > 1 && current !== 0 && (
          <button
            className="absolute left-4 opacity-0 group-hover:opacity-100 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
            onClick={prev}
          >
            <ChevronLeft size={32} />
          </button>
        )}
        <img
          onClick={() => setIsPreviewOpen(true)}
          src={normalizeMediaUrl(media[current].url)}
          className="w-full h-full object-cover transition-transform duration-300"
          draggable={false}
        />
        {media.length > 1 && current !== media.length - 1 && (
          <button
            className="absolute opacity-0 group-hover:opacity-100 right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
            onClick={next}
          >
            <ChevronRight size={32} />
          </button>
        )}

        {/* Counter */}
        <div
          className="absolute top-2 right-2 
bg-black/60 text-white text-xs 
px-2 py-0.5 rounded-full backdrop-blur-sm
opacity-0 translate-y-1 
group-hover:opacity-100 group-hover:translate-y-0
transition-all duration-300"
        >
          {current + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
          {media.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setIsPreviewOpen(true)}
              onMouseEnter={() => setCurrent(i)}
              className={`relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition ${
                i === current
                  ? "ring-2 ring-blue-500 dark:ring-blue-400 opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={normalizeMediaUrl(m.url)}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className=" inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-black/50 z-10"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X size={24} />
            </button>
            {media.length > 1 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
                onClick={prev}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <img
              src={normalizeMediaUrl(media[current].url)}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
            {media.length > 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
                onClick={next}
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PostActions({
  liked,
  saved,
  onLike,
  onComment,
  onSave,
  onShare,
}: {
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="flex justify-between px-6 py-4  border-slate-50 dark:border-slate-700/50">
      <div className="flex gap-7">
        <button
          onClick={onLike}
          className="flex flex-col items-center transition-transform duration-200 ease-in-out"
        >
          {liked ? (
            <HeartIcon className="w-6 h-6 text-blue-700 fill-blue-700 hover:text-blue-600 hover:scale-125 hover:rotate-12 transition-all duration-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 scale-100 transition-all duration-300" />
          )}
        </button>

        <button
          onClick={onComment}
          className="group transition-transform active:scale-110 focus:outline-none"
        >
          <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500  transition-all duration-300 ease-out" />
        </button>
        <button
          onClick={onShare}
          className="group transition-transform active:scale-110"
        >
          <Share2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      <button onClick={onSave}>
        {saved ? (
          <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400 scale-100 hover:scale-110 transition-all duration-500" />
        ) : (
          <Bookmark className="w-5 h-5 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 scale-100 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}
export function CommentsModal({
  open,
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

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  const toggleEmojiPicker = () => {
    if (!showCommentEmoji && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setPickerPos({
        top: rect.top - 320, // adjust based on picker height
        left: rect.left,
      });
    }

    setShowCommentEmoji((prev) => !prev);
    setShowReplyEmoji(false);
  };
  const buttonRefe = useRef<HTMLButtonElement | null>(null);
  const [pickerPose, setPickerPose] = useState({ top: 0, left: 0 });

  const toggleEmojiPickerreply = () => {
    if (!showReplyEmoji && buttonRefe.current) {
      const rect = buttonRefe.current.getBoundingClientRect();

      setPickerPos({
        top: rect.top - 320, // adjust based on picker height
        left: rect.left,
      });
    }

    setShowReplyEmoji((prev) => !prev);
    setShowCommentEmoji(false);
  };
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();

        setPickerPos({
          top: rect.top - 300,
          left: rect.left,
        });
      }
    };

    if (showCommentEmoji) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showCommentEmoji]);
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRefe.current) {
        const rect = buttonRefe.current.getBoundingClientRect();

        setPickerPose({
          top: rect.top - 300, // adjust if needed
          left: rect.left,
        });
      }
    };

    if (showReplyEmoji) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showReplyEmoji]);
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
      toast.error("Failed to like comment" + error);
      fetchComments();
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
      const regex = new RegExp(
        `@[^${HIDDEN}]+${HIDDEN}(?:[^${HIDDEN}]+${HIDDEN})?`,
        "g",
      );
      const parts = text.split(regex);
      const matches = text.match(regex) || [];

      const result: React.ReactNode[] = [];

      parts.forEach((part, index) => {
        result.push(<span key={`text-${index}`}>{part}</span>);

        if (matches[index]) {
          const inner = matches[index].slice(1);
          const segments = inner.split(HIDDEN).filter(Boolean);
          const displayName = segments[0];
          const profileId = segments[1] ?? null;

          result.push(
            <span
              key={`mention-${index}`}
              className={`text-blue-600 dark:text-blue-400 font-semibold ${profileId ? "cursor-pointer " : ""}`}
              onClick={
                profileId
                  ? (e) => {
                      e.stopPropagation();
                      navigate(`/profile/${profileId}`);
                    }
                  : undefined
              }
            >
              @{displayName}
            </span>,
          );
        }
      });

      return result;
    };
    const toDisplayText = (text: string) => {
      const HIDDEN = "\u200B";
      const regex = new RegExp(
        `(@[^${HIDDEN}]+)${HIDDEN}[^${HIDDEN}]+${HIDDEN}`,
        "g",
      );
      return text.replace(regex, `$1${HIDDEN}`);
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
                    className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 dark:focus:border-blue-400"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button
                    onClick={() => handleEdit(id)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full bg-slate-900 dark:bg-blue-600 text-white"
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
                      className="font-semibold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400"
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
                <div className="fixed inset-0  flex items-center justify-center z-50">
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

          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
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
                      ? "text-blue-700 fill-blue-700 scale-110"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600"
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
                  const mention = `@${comment.userName}${HIDDEN}${comment.profileId}${HIDDEN}`;
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
            <div className="mt-2 relative flex gap-3 w-full">
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
                    ref={buttonRefe}
                    type="button"
                    onClick={toggleEmojiPickerreply}
                    className="flex-shrink-0 cursor-pointer transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full"
                  >
                    <HiOutlineFaceSmile className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700 dark:text-slate-300" />
                  </button>

                  <input
                    value={toDisplayText(replyText)}
                    onChange={(e) => {
                      const HIDDEN = "\u200B";
                      const newVal = e.target.value;

                      const mentionMatch = replyText.match(
                        new RegExp(
                          `^@[^${HIDDEN}]+${HIDDEN}[^${HIDDEN}]+${HIDDEN}`,
                        ),
                      );
                      const mentionPrefix = mentionMatch
                        ? mentionMatch[0]
                        : null;
                      const displayPrefix = mentionPrefix
                        ? toDisplayText(mentionPrefix)
                        : null;

                      if (mentionPrefix && displayPrefix) {
                        if (!newVal.startsWith(displayPrefix)) {
                          setReplyText(
                            newVal.replace(
                              new RegExp(`^@[^${HIDDEN}]*${HIDDEN}?`),
                              "",
                            ),
                          );
                        } else {
                          const suffix = newVal.slice(displayPrefix.length);
                          setReplyText(mentionPrefix + suffix);
                        }
                      } else {
                        setReplyText(newVal);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        replyText.trim() &&
                        !addCommentMutation.isPending
                      ) {
                        e.preventDefault();
                        handleAddComment(id);
                      }
                    }}
                    placeholder="Write a reply..."
                    className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
                  />
                </div>
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

                {showReplyEmoji && (
                  <>
                    {/* overlay background (optional) */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowReplyEmoji(false)}
                    />

                    {/* picker */}
                    <div
                      className="fixed z-50"
                      style={{
                        top: pickerPose.top,
                        left: pickerPose.left,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MyEmojiPicker
                        onSelect={handleEmojiSelect}
                        width={300}
                        height={300}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full mt-2 border-t border-slate-50 dark:border-slate-700/50 bg-white dark:bg-slate-800  overflow-visible">
      <div className="flex items-center justify-between px-4 py-3  border-slate-100 dark:border-slate-700/50">
        <div className=" text-slate-400 dark:text-slate-100 text-sm">
          Comments {comments.length}
        </div>
      </div>

      <div className=" relative max-h-[500px] overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar scrollbar-hide scroll-smooth">
        {loading ? (
          <div className="space-y-4 dark:opacity-60 transition-opacity">
            <Skeleton height={20} width={200} />
            <Skeleton height={15} count={3} />
            <Skeleton height={200} />
          </div>
        ) : comments.length === 0 ? (
          <div className=" text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
            No comments yet. Be the first to share!
          </div>
        ) : (
          comments.map((c) => renderComment(c))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative w-full border-t border-slate-100 dark:border-slate-700/50 px-4 py-3 flex gap-3 items-center bg-slate-50/50 dark:bg-slate-900/20">
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleEmojiPicker}
            className="cursor-pointer transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full"
          >
            <HiOutlineFaceSmile className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </button>

          {showCommentEmoji && (
            <>
              {/* overlay background (optional) */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCommentEmoji(false)}
              />

              {/* picker */}
              <div
                className="fixed z-50"
                style={{
                  top: pickerPos.top,
                  left: pickerPos.left,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MyEmojiPicker
                  onSelect={handleEmojiSelectComment}
                  width={300}
                  height={300}
                />
              </div>
            </>
          )}
        </div>

        <input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              newComment.trim() &&
              !addCommentMutation.isPending
            ) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          className="flex-1 min-w-0 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
        />

        <button
          onClick={() => handleAddComment()}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
            newComment.trim()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
          }`}
        >
          {addCommentMutation.isPending && actionType === "comment"
            ? "Adding..."
            : "Add"}
        </button>
      </div>
    </div>
  );
}

export default function PostDetailsPage() {
  usePageTitle("Post Details");
  const { postId } = useParams<{ postId: string }>();
  const currentUserId = getUserId() || "";

  // Modal States
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [openLikes, setOpenLikes] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(true);

  // 1. Fetch Post Data
  const { data: PostDetails, isLoading } = useQuery<PostDetails>({
    queryKey: ["PostDetails", postId],
    queryFn: async () => {
      const response = await getPostById(postId!);
      return response.data;
    },
    enabled: !!postId,
  });

  // 2. Use the new actions hook
  // This hook handles all the cache updates (Optimistic UI) for us
  const { like, save, follow, remove } = usePostDetailsActions(postId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!PostDetails) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
        Post not found
      </div>
    );
  }

  const hasMedia = PostDetails.media_URLs && PostDetails.media_URLs.length > 0;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${PostDetails.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `رحلة ${PostDetails.userName} على رحال`,
          text: PostDetails.description || "شوف المغامرة دي!",
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error("Sharing failed");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  return (
    <div className="  max-w-2xl mx-auto bg-white dark:bg-slate-900   border-x border-slate-100 dark:border-slate-700/50 border rounded-2xl overflow-hidden">
      <PostHeader
        id={PostDetails.id}
        userName={PostDetails.userName}
        profileUrl={PostDetails.profileURL}
        profileId={PostDetails.userId}
        isFollowed={PostDetails.isFollowedByCurrentUser ?? false}
        onFollow={() => follow(PostDetails.userId)}
        currentUserId={currentUserId}
        createdAt={PostDetails.createdDate}
        onDelete={() => setOpenModal(true)}
        onEdit={() => setEditModalOpen(true)}
      />

      <div className="px-4">
        {!hasMedia && (
          <PostContent
            description={PostDetails.description}
            className="px-4 py-8 text-lg font-medium wrap-break-word leading-relaxed text-slate-900 dark:text-slate-100"
          />
        )}
        {hasMedia && <PostMedia media={PostDetails.media_URLs} />}
      </div>

      <PostActions
        liked={PostDetails.isLiked ?? false}
        saved={PostDetails.isSaved ?? false}
        onLike={like}
        onSave={save}
        onComment={() => document.getElementById("main-input")?.focus()}
        onShare={handleShare}
      />

      <div
        onClick={() => setOpenLikes(true)}
        className="px-4 text-sm font-semibold mt-1 cursor-pointer text-slate-900 dark:text-slate-100"
      >
        {PostDetails.likes} likes
      </div>

      {hasMedia && (
        <PostContent
          description={PostDetails.description}
          className="px-4 mt-1 text-sm wrap-break-word text-slate-800 dark:text-slate-200"
        />
      )}

      {/* Modals */}
      {openLikes && (
        <div
          onClick={() => setOpenLikes(false)}
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenLikes(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Likes
            </h3>
            <LikesList type="post" id={PostDetails.id} />
          </div>
        </div>
      )}

      <ConfirmModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={remove}
        itemType={"post"}
      />

      {editModalOpen && (
        <EditPostModal
          postId={PostDetails.id}
          onCancel={() => setEditModalOpen(false)}
        />
      )}
      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={PostDetails.id}
        currentUserId={getUserId() || ""}
      />
    </div>
  );
}
