import type { Post } from "../../../types/post";
import type { PostMediaItem } from "../../../types/post";
import { PostContent } from "./PostContent";
import type { PostsResponse } from "../../../types/post";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
} from "lucide-react";
import { MapPinIcon as MapPinSolid } from "@heroicons/react/24/solid";
import { MapPinIcon as MapPinOutline } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { deletePost, normalizeMediaUrl, savePost, likePost } from "./services/posts.api";
import { getUserId } from "../../../utils/auth";
import { CommentsModal } from "../components/CommentsModal";
import { useNavigate } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
// import { motion, AnimatePresence } from "framer-motion";
import { ReportModal } from "../../reports/components/ReportModal";
import { followUser } from "./services/posts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
console.log("logged:", currentUserId);
console.log("post owner:", profileId);
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
  profileUrl = profileUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;
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
        <img src={normalizeMediaUrl(profileUrl)} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex flex-col leading-tight">
          <span
            onClick={() => navigate(`/profile/${profileId}`)}
            className="font-semibold cursor-pointer hover:underline"
          >
            {userName}
          </span>          {createdAt && (
            <span className="text-xs text-gray-500">
              {formatTime(createdAt)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isOwner && (
          <button
            onClick={onFollow}
            className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${isFollowing
                ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                : "bg-white border border-black text-black hover:bg-gray-100"
              }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
{isReportOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <ReportModal
      entityType="post"
      entityId={id}
      onClose={() => setIsReportOpen(false)}
    />
  </div>
)}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 overflow-hidden translate-x-3">
              {isOwner ? (
                <>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    onClick={onEdit}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 transition-colors"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 transition-colors"
                  onClick={() => {
setDropdownOpen(!dropdownOpen);                    setIsReportOpen(true);
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
        className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group select-none"
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
        <div className="absolute top-2 right-2 
bg-black/60 text-white text-xs 
px-2 py-0.5 rounded-full backdrop-blur-sm
opacity-0 translate-y-1 
group-hover:opacity-100 group-hover:translate-y-0
transition-all duration-300">
          {current + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {media.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setCurrent(i)}
              onMouseEnter={() => setCurrent(i)}
              className={`relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition ${
                i === current
                  ? "ring-2 ring-blue-200"
                  : "opacity-80 hover:opacity-100"
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
    </div>
  );
}
export function PostActions({
  liked,
  saved,
  onLike,
  onComment,
  onSave,
}: {
  
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
}) {
  return (
    <div className="flex justify-between px-5 py-2">
      <div className="flex gap-6">
        <button
          onClick={onLike}
          className=" flex flex-col items-center transition-transform duration-200 ease-in-out"
        >
          {liked ? (
            <HeartIcon
  className="w-6 h-6 text-primary-500 fill-primary-500
  hover:text-primary-200 
  hover:scale-125 
  hover:rotate-12 
  transition-all duration-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-black scale-100 transition-all duration-300" />
          )}
          
        </button>
        
        <button onClick={onComment} className=" flex flex-col items-center transition-transform duration-200 ease-in-out">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-black hover:scale-105 
  hover:rotate-1 
  transition-all duration-500" />
  
        </button>
       <button className="hover:scale-105 transition">
  <PaperAirplaneIcon className="w-6 h-6 text-black rotate-315" />
</button>
      </div>

     <button onClick={onSave}>
  {saved ? (
    <MapPinSolid className="w-6 h-6 text-primary-500 fill-primary-500 scale-100 hover:scale-110 
  transition-all duration-500" />
  ) : (
    <MapPinOutline className="w-6 h-6 text-black scale-100 transition-all duration-300" />
  )}
</button>
    </div>
  );
}

export default function PostCard({
  post,
  onPostDeleted,
}: {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}) {
  const hasMedia = post.mediaUrLs && post.mediaUrLs.length > 0;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likes ?? 0);

  const navigate = useNavigate();
  async function handleSaveToggle() {
    const prev = isSaved;
    setIsSaved(!prev);

    try {
      await savePost(post.id);
    } catch (err) {
      console.error(err);
      setIsSaved(prev);

    }
  }

  async function handleDeletePost() {
    try {
      await deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEditPost() {
    navigate(`/edit-post/${post.id}`);
  }
  async function handleLike() {
    const prevLiked = isLiked;

    // optimistic update
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? likesCount - 1 : likesCount + 1);

    try {
      await likePost(post.id);
    } catch (error) {
      setIsLiked(prevLiked);
      setLikesCount(likesCount);

      console.error("Like failed", error);
    }
  }
  
    const queryClient = useQueryClient();

const followMutation = useMutation({
  mutationFn: followUser,

  onMutate: async (userId: string) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });

const previousPosts = queryClient.getQueryData<PostsResponse>(["posts"]);
   queryClient.setQueryData<PostsResponse>(["posts"], (old) => {
  if (!old) return old;

  return {
    ...old,
    data: {
      ...old.data,
      items: old.data.items.map((p) =>
        p.userId === userId
          ? {
              ...p,
              isFollowedByCurrentUser: !p.isFollowedByCurrentUser,
            }
          : p
      ),
    },
  };
});

    return { previousPosts };
  },

  onError: (_err, _userId, context) => {
    if (context?.previousPosts) {
      queryClient.setQueryData(["posts"], context.previousPosts);
    }
  },
});
function handleFollow() {
  followMutation.mutate(post.userId);
}
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6 max-w-xl mx-auto">
      <PostHeader
        id={post.id}
        userName={post.userName}
        profileUrl={post.profileUrl}
        profileId={post.userId}
isFollowing={post.isFollowedByCurrentUser}
  onFollow={handleFollow}        currentUserId={getUserId()}
        createdAt={post.createdDate}
        onDelete={handleDeletePost}
        onEdit={handleEditPost}
      />

      {!hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 py-8 text-lg font-medium leading-relaxed"
        />
      )}

      {hasMedia && <PostMedia media={post.mediaUrLs} />}

      <PostActions

        liked={isLiked}
        saved={isSaved}
        onLike={handleLike}
        onSave={handleSaveToggle}
        onComment={() => setCommentsOpen(true)}
      />

      <div className="px-4 text-sm font-semibold mt-1">
        {likesCount} likes
      </div>

      {hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 mt-1 text-sm"
        />
      )}
{(post.comments ?? 0) > 0 && (
  <div
    className="px-4 pb-3 text-sm text-gray-500 cursor-pointer"
    onClick={() => setCommentsOpen(true)}
  >
    View all {post.comments ?? 0} comments
  </div>
)}
      <CommentsModal
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={post.id}
        currentUserId={getUserId() || ""}
      />
    </div>
  );
}