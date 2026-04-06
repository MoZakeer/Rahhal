import type { Post } from "../../../types/post";
import type { PostMediaItem } from "../../../types/post";
import { PostContent } from "./PostContent";
import type { PostsResponse } from "../../../types/post";
import toast from "react-hot-toast";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  MessageCircle,
  Share2,
  GlobeIcon,
} from "lucide-react";
import { Bookmark } from "lucide-react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { normalizeMediaUrl } from "./services/posts.api";
import { getUserId } from "../../../utils/auth";
import { CommentsModal } from "../components/CommentsModal";
import { useNavigate } from "react-router-dom";
// import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ReportModal } from "../../reports/components/ReportModal";
import { followUser } from "./services/posts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLikePost, useSavePost, useDeletePost } from "./hooks/usePosts";
import type { InfiniteData } from "@tanstack/react-query";
import ConfirmModal from "../../ReportDetals/components/confirmModal";
import { LikesList } from "./LikesList";
import EditPostModal from "../components/EditPostModal";
import type { PostDetails } from "../../../types/post";
export function PostHeader({
  id,
  userName,
  profileUrl,
  profileId,
  currentUserId,
  isFollowing,
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
  isFollowing?: boolean;
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
    <div
      className="flex items-center justify-between px-4 py-3 relative cursor-pointer"
      onClick={() => navigate(`/post/${id}`)}
    >
      <div className="flex items-center gap-3">
        <img
        onClick={(e) => {
    e.stopPropagation(); 
    navigate(`/profile/${profileId}`);
  }}
          src={normalizeMediaUrl(profileUrl)}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col leading-tight">
          <span
         onClick={(e) => {
    e.stopPropagation(); 
    navigate(`/profile/${profileId}`);
  }}
            className="font-semibold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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

      <div className="flex items-center gap-2" onClick={(e) => {
    e.stopPropagation(); }}>
        {!isOwner && (
          <button
            onClick={onFollow}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
              isFollowing
                ? "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                : "bg-slate-900 dark:bg-indigo-600 border border-slate-900 dark:border-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
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
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
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

  // Drag Move
  const handleMove = (x: number) => {
    if (!isDragging.current || startX.current === null) return;

    const diff = x - startX.current;

    // Threshold prevents accidental swipes
    if (diff > 80) {
      prev();
      isDragging.current = false;
    }

    if (diff < -80) {
      next();
      isDragging.current = false;
    }
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
        onClick={() => setIsPreviewOpen(true)}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <img
          src={normalizeMediaUrl(media[current].url)}
          className="w-full h-full object-cover transition-transform duration-300"
          draggable={false}
        />

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
                  ? "ring-2 ring-indigo-500 dark:ring-indigo-400 opacity-100"
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

      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
        onClick={prev}
      >
        <ChevronLeft size={32} />
      </button>

      <img
        src={normalizeMediaUrl(media[current].url)}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
      />

      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10"
        onClick={next}
      >
        <ChevronRight size={32} />
      </button>
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
    <div className="flex justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-700/50">
      <div className="flex gap-7">
        <button
          onClick={onLike}
          className="flex flex-col items-center transition-transform duration-200 ease-in-out"
        >
          {liked ? (
            <HeartIcon className="w-6 h-6 text-indigo-600 fill-indigo-600 hover:text-indigo-600 hover:scale-125 hover:rotate-12 transition-all duration-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-slate-400 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 scale-100 transition-all duration-300" />
          )}
        </button>

        <button
          onClick={onComment}
          className="group transition-transform active:scale-110 focus:outline-none"
        >
          <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 group-hover:fill-indigo-50/30 transition-all duration-300 ease-out" />
        </button>
        <button
          onClick={onShare}
          className="group transition-transform active:scale-110"
        >
          <Share2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </button>
      </div>

      <button onClick={onSave}>
        {saved ? (
          <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400 scale-100 hover:scale-110 transition-all duration-500" />
        ) : (
          <Bookmark className="w-5 h-5 text-slate-400 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 scale-100 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const hasMedia = post.mediaUrLs && post.mediaUrLs.length > 0;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  function handleEditPost() {
    setEditModalOpen(true);
  }

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const deleteMutation = useDeletePost();
  const [openLikes, setOpenLikes] = useState(false);

  function handleLike() {
    likeMutation.mutate(post.id);
  }

  function handleSave() {
    saveMutation.mutate(post.id);
  }

  function handleDelete() {
    deleteMutation.mutate(post.id);
    toast("Deleting post!", {
      duration: 2000,
      style: {
        border: "1px solid #ef4444",
        padding: "5px",
        color: "#ef4444",
        background: "#FFFfff",
      },
      iconTheme: {
        primary: "#ef4444",
        secondary: "#FFFfff",
      },
    });
  }

  const queryClient = useQueryClient();

const followMutation = useMutation({
  mutationFn: followUser,

  onMutate: async (userId: string) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });
    await queryClient.cancelQueries({ queryKey: ["PostDetails"] });

    const previousPosts =
      queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);

    // Optimistic update: feed cache
    queryClient.setQueryData<InfiniteData<PostsResponse>>(["posts"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            items: page.data.items.map((p) =>
              p.userId === userId
                ? {
                    ...p,
                    isFollowedByCurrentUser: !p.isFollowedByCurrentUser,
                  }
                : p
            ),
          },
        })),
      };
    });

    // ✅ Optimistic update: PostDetails cache
    // Find the post in feed to get its postId
    const feedPost = queryClient
      .getQueryData<InfiniteData<PostsResponse>>(["posts"])
      ?.pages.flatMap((p) => p.data.items)
      .find((p) => p.userId === userId);

    if (feedPost) {
      const currentPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        feedPost.id,
      ]);
      if (currentPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", feedPost.id], {
          ...currentPost,
          isFollowedByCurrentUser: !currentPost.isFollowedByCurrentUser,
        });
      }
    }

    return { previousPosts };
  },

  // ✅ Sync PostDetails cache with confirmed value from feed
  onSuccess: (_data, userId) => {
    const feedPost = queryClient
      .getQueryData<InfiniteData<PostsResponse>>(["posts"])
      ?.pages.flatMap((p) => p.data.items)
      .find((p) => p.userId === userId);

    if (feedPost) {
      const currentPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        feedPost.id,
      ]);
      if (currentPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", feedPost.id], {
          ...currentPost,
          isFollowedByCurrentUser: feedPost.isFollowedByCurrentUser,
        });
      }
    }
  },

  onError: (_err, _userId, context) => {
    if (context?.previousPosts) {
      queryClient.setQueryData(["posts"], context.previousPosts);
    }
  },

  // ✅ No invalidation — GetAll returns wrong isFollowedByCurrentUser
  onSettled: () => {},
});

  function handleFollow() {
    followMutation.mutate(post.userId);
  }
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `رحلة ${post.userName} على رحال`,
          text: post.description || "شوف المغامرة دي!",
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
        toast.success("Link copied! Share it anywhere", {
          icon: "📋",
          style: { borderRadius: "15px", background: "#333", color: "#fff" },
        });
      } catch {
        toast.error("Could not copy link");
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm mb-6 max-w-xl mx-auto border border-transparent dark:border-slate-700/60 transition-colors">
      <PostHeader
        id={post.id}
        userName={post.userName}
        profileUrl={post.profileUrl}
        profileId={post.userId}
        isFollowing={post.isFollowedByCurrentUser}
        onFollow={handleFollow}
        currentUserId={getUserId()}
        createdAt={post.createdDate}
        onDelete={() => setOpenModal(true)}
        onEdit={handleEditPost}
      />

      {!hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 py-8 text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-100"
        />
      )}

      {hasMedia && <PostMedia media={post.mediaUrLs} />}

      <PostActions
        liked={post.isLiked ?? false}
        saved={post.isSaved ?? false}
        onLike={handleLike}
        onSave={handleSave}
        onComment={() => setCommentsOpen(true)}
        onShare={handleShare}
      />

      <div
        onClick={() => setOpenLikes(true)}
        className="px-4 text-sm font-semibold mt-1 cursor-pointer text-slate-900 dark:text-slate-100 "
      >
        {post.likes} likes
      </div>

      {openLikes && (
        <div
          onClick={() => setOpenLikes(false)}
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-lg p-5 relative border border-transparent dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpenLikes(false)}
              className="absolute top-3 right-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              Likes
            </h3>

            <LikesList type="post" id={post.id} />
          </div>
        </div>
      )}

      {hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 mt-1 text-sm text-slate-800 dark:text-slate-200"
        />
      )}

      {(post.comments ?? 0) > 0 && (
       <div
  className="px-4 pb-3 text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
  onClick={() => setCommentsOpen(prev => !prev)} // toggle
>
  {commentsOpen
    ? "Hide comments"
    : `View all ${post.comments} ${post.comments === 1 ? "comment" : "comments"}`}
</div>
      )}

      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        currentUserId={getUserId() || ""}
      />

      <ConfirmModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleDelete}
        itemType={"post"}
      />

      {editModalOpen && (
        <EditPostModal
          postId={post.id}
          onCancel={() => setEditModalOpen(false)}
        />
      )}
    </div>
  );
}
