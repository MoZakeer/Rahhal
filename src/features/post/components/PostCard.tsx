import type { Post } from "../../../types/post";
import type { PostMediaItem } from "../../../types/post";
import { PostContent } from "./PostContent";
import type { PostsResponse } from "../../../types/post";
import toast from "react-hot-toast";
import { MessageCircle, Heart, Share2, Globe, ChevronLeft, ChevronRight, UserPlus, UserCheck, MoreHorizontal, Edit, Trash2, Flag, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { normalizeMediaUrl } from "./services/posts.api";
import { getUserId } from "../../../utils/auth";
import { CommentsModal } from "../components/CommentsModal";
import { useNavigate } from "react-router-dom";
import { ReportModal } from "../../reports/components/ReportModal";
import { followUser } from "./services/posts.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLikePost, useSavePost, useDeletePost } from "./hooks/usePosts";
import type { InfiniteData } from "@tanstack/react-query";
import ConfirmModal from "../../ReportDetals/components/confirmModal";
import { LikesList } from "./LikesList";
import EditPostModal from "../components/EditPostModal"

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
  onReport,
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
        <img src={normalizeMediaUrl(profileUrl)} onClick={() => navigate(`/profile/${profileId}`)} className="w-10 h-10 rounded-full object-cover cursor-pointer" />
        <div className="flex flex-col leading-tight">
          <span onClick={() => navigate(`/profile/${profileId}`)} className="font-extrabold text-slate-950 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-[15px] tracking-tight">
            {userName}
          </span>
          {createdAt && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
              {formatTime(createdAt)} <Globe className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isOwner && (
          <FollowButton
            isFollowing={isFollowing ?? false}
            onClick={onFollow || (() => { })}
          />
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {isReportOpen && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
              <ReportModal
                entityType="post"
                entityId={id}
                onClose={() => setIsReportOpen(false)}
              />
            </div>
          )}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden translate-x-3">
              {isOwner ? (
                <>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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
                    setDropdownOpen(!dropdownOpen); setIsReportOpen(true);
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

  const next = () => setCurrent((prev) => (prev + 1) % media.length);
  const prev = () => setCurrent((prev) => (prev - 1 + media.length) % media.length);

  const handleStart = (x: number) => { startX.current = x; isDragging.current = true; };
  const handleMove = (x: number) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = x - startX.current;
    if (diff > 80) { prev(); isDragging.current = false; }
    if (diff < -80) { next(); isDragging.current = false; }
  };
  const handleEnd = () => { isDragging.current = false; startX.current = null; };

  return (
    <div className="w-full">
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
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {current + 1} / {media.length}
        </div>
      </div>
      {media.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {media.map((m, i) => (
            <div
              key={m.id}
              onClick={() => setCurrent(i)}
              onMouseEnter={() => setCurrent(i)}
              className={`relative h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition ${i === current
                ? "ring-2 ring-blue-200 dark:ring-blue-500"
                : "opacity-80 hover:opacity-100"
                }`}
            >
              <img src={normalizeMediaUrl(m.url)} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PostActions({
  liked, saved, onLike, onComment, onSave, onShare,
}: {
  liked: boolean; saved: boolean; onLike: () => void; onComment: () => void; onSave: () => void; onShare: () => void;
}) {
  return (
    <div className="flex justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-700/50">
      <div className="flex gap-7">
        <button onClick={onLike} className="flex items-center gap-2 group relative">
          <Heart className={`w-5 h-5 transition-all duration-300 ${liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-400 group-hover:text-rose-400'}`} />
          {liked && <motion.div layoutId="likeGlow" className="absolute -inset-2 bg-rose-100 dark:bg-rose-500/20 rounded-full blur-xl opacity-50 z-0" />}
        </button>

        <button onClick={onComment} className="group transition-transform active:scale-110 focus:outline-none">
          <MessageCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:fill-indigo-50/30 transition-all duration-300 ease-out" />
        </button>

        <button onClick={onShare} className="group transition-transform active:scale-110">
          <Share2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </button>
      </div>

      <button onClick={onSave} className="transition-transform active:scale-110 focus:outline-none">
        {saved ? <Bookmark className="w-4 h-4 text-indigo-600 fill-indigo-600 shadow-indigo-100 dark:shadow-none" /> : <Bookmark className="w-4 h-4 text-slate-400 hover:text-indigo-400 transition-colors" />}
      </button>
    </div>
  );
}

export default function PostCard({ post }: { post: Post; }) {
  const hasMedia = post.mediaUrLs && post.mediaUrLs.length > 0;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  function handleEditPost() { setEditModalOpen(true); }
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const deleteMutation = useDeletePost();
  const [openLikes, setOpenLikes] = useState(false);
  
  function handleLike() { likeMutation.mutate(post.id); }
  function handleSave() { saveMutation.mutate(post.id); }

  function handleDelete() {
    deleteMutation.mutate(post.id);
    toast("Deleting post!", {
      duration: 2000,
      style: { border: "1px solid #ef4444", padding: "5px", color: "#ef4444", background: "#FFFfff" },
      iconTheme: { primary: "#ef4444", secondary: "#FFFfff" },
    });
  }

  const queryClient = useQueryClient();
  const followMutation = useMutation({
    mutationFn: followUser,
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);
      queryClient.setQueryData<InfiniteData<PostsResponse>>(
        ["posts"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                items: page.data.items.map((p) =>
                  p.userId === userId ? { ...p, isFollowedByCurrentUser: !p.isFollowedByCurrentUser } : p
                ),
              },
            })),
          };
        }
      );
      return { previousPosts };
    },
    onError: (_err, _userId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
  });
  
  function handleFollow() { followMutation.mutate(post.userId); }

  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      if (!post.isLiked) { handleLike(); }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `رحلة ${post.userName} على رحال`, text: post.description || "شوف المغامرة دي!", url: shareUrl });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') { toast.error("Sharing failed"); }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied! Share it anywhere", { icon: '📋', style: { borderRadius: '15px', background: '#333', color: '#fff' } });
      } catch (err) {
        toast.error("Could not copy link");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100/70 dark:border-slate-700/60 shadow-sm overflow-hidden mb-6 max-w-xl mx-auto transition-all hover:shadow-lg dark:hover:shadow-slate-900/50 hover:border-slate-100 dark:hover:border-slate-600 group/card pb-2"
    >
      <div>
        <PostHeader
          id={post.id} userName={post.userName} profileUrl={post.profileUrl} profileId={post.userId}
          isFollowing={post.isFollowedByCurrentUser} onFollow={handleFollow} currentUserId={getUserId()}
          createdAt={post.createdDate} onDelete={() => setOpenModal(true)} onEdit={handleEditPost}
        />

        <div className="relative select-none" onClick={handleDoubleTap}>
          {post.mediaUrLs?.length ? <PostMediaScroll media={post.mediaUrLs} /> : (
            <div className="mx-4 flex text-center text-slate-800 dark:text-slate-200 font-medium text-sm mb-2">
              {!hasMedia && <PostContent description={post.description} />}
            </div>
          )}

          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.3, 1], rotate: [-15, 15, 0], opacity: 1 }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <HeartIcon className="w-22 h-22 text-red-500 fill-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PostActions
          liked={post.isLiked ?? false} saved={post.isSaved ?? false}
          onLike={handleLike} onSave={handleSave} onComment={() => setCommentsOpen(true)} onShare={handleShare}
        />

        <div onClick={() => setOpenLikes(true)} className="px-[24px] text-sm font-semibold cursor-pointer text-slate-900 dark:text-slate-200">
          {post.likes} likes
        </div>

        {openLikes && (
          <div onClick={() => setOpenLikes(false)} className="fixed inset-0 bg-black/40 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-lg p-5 relative text-slate-900 dark:text-slate-100">
              <button onClick={() => setOpenLikes(false)} className="absolute top-3 right-3 text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white">✕</button>
              <h3 className="text-lg font-semibold mb-4">Likes</h3>
              <LikesList type="post" id={post.id} />
            </div>
          </div>
        )}

        {hasMedia && (
          <PostContent description={post.description} className="px-[24px] mt-1 text-sm text-slate-800 dark:text-slate-200" />
        )}

        {(post.comments ?? 0) > 0 && (
          <div className="px-4 pb-3 text-sm text-gray-500 dark:text-slate-400 cursor-pointer hover:text-gray-700 dark:hover:text-slate-300" onClick={() => setCommentsOpen(true)}>
            View all {post.comments} {post.comments === 1 ? "comment" : "comments"}
          </div>
        )}

        <CommentsModal open={commentsOpen} onClose={() => setCommentsOpen(false)} postId={post.id} currentUserId={getUserId()} />
        <ConfirmModal open={openModal} onClose={() => setOpenModal(false)} onConfirm={handleDelete} itemType={"post"} />
        {editModalOpen && <EditPostModal postId={post.id} onCancel={() => setEditModalOpen(false)} />}
      </div>
    </motion.div>
  );
}

function PostMediaScroll({ media }: { media: PostMediaItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(media.length > 1);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!media.length) return null;

  return (
    <div className="relative group w-full px-4 mb-2">
      <div ref={scrollRef} onScroll={checkArrows} className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-2xl pb-1">
        {media.map((item, index) => (
          <div key={item.id || index} className="relative flex-none w-full aspect-[16/10] snap-center rounded-[2rem] overflow-hidden bg-slate-900 dark:bg-black">
            <img src={normalizeMediaUrl(item.url)} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110" aria-hidden="true" />
            <img src={normalizeMediaUrl(item.url)} className="relative z-10 w-full h-full object-contain shadow-2xl" alt={`Adventure ${index + 1}`} loading="lazy" draggable={false} />
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <div className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          1 / {media.length}
        </div>
      )}

      <AnimatePresence>
        {showLeftArrow && (
          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={() => scroll('left')} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full shadow-lg border border-white/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}
        {showRightArrow && (
          <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => scroll('right')} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-full shadow-lg border border-white/50 dark:border-slate-600/50 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all">
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FollowButton({ isFollowing, onClick }: { isFollowing: boolean, onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        relative h-9 px-5 rounded-full text-[12px] font-bold tracking-tight 
        transition-all duration-300 ease-in-out border flex items-center gap-1.5
        ${isFollowing
          ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300" 
          : "bg-slate-950 dark:bg-indigo-500 border-slate-950 dark:border-indigo-500 text-white hover:bg-slate-800 dark:hover:bg-indigo-600" 
        }
      `}
    >
      <AnimatePresence mode="wait">
        {isFollowing ? (
          <motion.span key="following" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" strokeWidth={2.5} /> Following
          </motion.span>
        ) : (
          <motion.span key="follow" initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5} /> Follow
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}