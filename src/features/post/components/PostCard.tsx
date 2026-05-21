import type { Post } from "../../../types/post";
import type { PostMediaItem } from "../../../types/post";
import { PostContent } from "./PostContent";
import type { PostsResponse } from "../../../types/post";
import toast from "react-hot-toast";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  MessageCircle,
  Share2,
  GlobeIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Link as LinkIcon,
  CopyCheck
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
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export function PostHeader({
  id,
  userName,
  profileUrl,
  profileId,
  currentUserId,
  isFollowing,
  createdAt,
  post,
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
  post?: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  onFollow?: () => void;
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

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

    if (diff < 60) return t("feed.justNow");
    if (diff < 3600) return `${Math.floor(diff / 60)}${t("feed.minsAgo")}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t("feed.hoursAgo")}`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}${t("feed.daysAgo")}`;

    return created.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US');
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 relative cursor-pointer"
      onClick={() => navigate(`/post/${id}`, { state: { post } })}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-3">
        <img
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${profileId}`);
          }}
          alt={userName}
          loading="lazy"
          decoding="async"
          src={normalizeMediaUrl(profileUrl)}
          className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
        />
        <div className="flex flex-col leading-tight">
          <span
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${profileId}`);
            }}
            className="font-semibold cursor-pointer text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {userName}
          </span>
          {createdAt && (
            <span 
              className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5"
              dir="auto"
            >
              {formatTime(createdAt)} <GlobeIcon className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {!isOwner && (
          <button
            onClick={(e) => {
               e.stopPropagation();
               onFollow?.();
            }}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-200 ${isFollowing
              ? "bg-slate-50 dark:bg-blue-950/30 border border-slate-200 dark:border-blue-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              : "bg-blue-700 dark:bg-blue-600 border border-transparent text-white hover:bg-blue-800 dark:hover:bg-blue-700 shadow-sm"
              }`}
          >
            {isFollowing ? t("feed.following") : t("feed.follow")}
          </button>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
               e.stopPropagation();
               setDropdownOpen(!dropdownOpen);
            }}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {isReportOpen && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
              <ReportModal
                entityType="post"
                entityId={id}
                open={true}
                onClose={() => setIsReportOpen(false)}
              />
            </div>
          )}
          
          {dropdownOpen && (
            <div className={cn(
              "absolute top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-100",
              isRtl ? "left-0" : "right-0"
            )}>
              {isOwner ? (
                <>
                  <button
                  type="button"
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false);
    onEdit?.();
  }}
                  >
                    <Edit className="w-4 h-4" />
                    {t("feed.edit")}
                  </button>
                  <button
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-slate-50 dark:border-slate-700/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(false);
                      onDelete?.();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("feed.delete")}
                  </button>
                </>
              ) : (
                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    setIsReportOpen(true);
                  }}
                >
                  <Flag className="w-4 h-4" />
                  {t("feed.report")}
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);
  const currentMedia = media[current];

  // Video Observer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.defaultMuted = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.warn("Autoplay blocked by browser. User interaction required.", error);
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [current]);

  if (!media.length) return null;

  const isVideo = (item: PostMediaItem) => {
    if (item.type) return item.type === "video";
    return /\.(mp4|webm|ogg|mov)$/i.test(item.url);
  };

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

  const handleMove = (x: number) => {
    if (!isDragging.current || startX.current === null) return;
    const diff = startX.current - x;

    if (diff > 50) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isRtl ? prev() : next();
      isDragging.current = false;
    }
    if (diff < -50) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      isRtl ? next() : prev();
      isDragging.current = false;
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Main Image (Swipe Area) */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/3] max-h-[450px] rounded-2xl overflow-hidden group select-none bg-slate-950 cursor-pointer shadow-sm border border-slate-100 dark:border-slate-800/60"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {media.length > 1 && current !== 0 && (
          <button
            className={cn(
              "absolute opacity-0 group-hover:opacity-100 top-1/2 -translate-y-1/2 text-white p-1.5 bg-black/30 rounded-full hover:bg-black/50 z-20 transition-all backdrop-blur-sm",
              isRtl ? "right-2" : "left-2"
            )}
            onClick={(e) => { e.stopPropagation(); prev(); }}
            title={t("feed.prevMedia")}
            aria-label={t("feed.prevMedia")}
          >
            {isRtl ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
        )}

        <div key={current} className="w-full h-full animate-in fade-in duration-300 ease-out flex items-center justify-center">
          {isVideo(currentMedia) ? (
            <video
              ref={videoRef}
              src={normalizeMediaUrl(currentMedia.url)}
              className="w-full h-full object-cover"
              controls
              playsInline
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <img
              onClick={() => setIsPreviewOpen(true)}
              src={normalizeMediaUrl(currentMedia.url)}
              alt={t("feed.mediaAlt")}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              draggable={false}
            />
          )}
        </div>

        {media.length > 1 && current !== media.length - 1 && (
          <button
            className={cn(
              "absolute opacity-0 group-hover:opacity-100 top-1/2 -translate-y-1/2 text-white p-1.5 bg-black/30 rounded-full hover:bg-black/50 z-20 transition-all backdrop-blur-sm",
              isRtl ? "left-2" : "right-2"
            )}
            onClick={(e) => { e.stopPropagation(); next(); }}
            title={t("feed.nextMedia")}
            aria-label={t("feed.nextMedia")}
          >
            {isRtl ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
          </button>
        )}

        {media.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-10">
            {media.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full ${i === current
                  ? "w-4 h-1.5 bg-white shadow-sm"
                  : "w-1.5 h-1.5 bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 text-white font-medium text-[10px] px-2 py-1 rounded-full backdrop-blur-md z-10 tabular-nums">
          {current + 1} / {media.length}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div
            className="inset-0 flex items-center justify-center relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={cn(
                "absolute top-4 text-white p-2 rounded-full hover:bg-black/50 z-10 transition-colors",
                isRtl ? "left-4" : "right-4"
              )}
              onClick={() => setIsPreviewOpen(false)}
              title={t("feed.closePreview")} 
              aria-label={t("feed.closePreview")}
            >
              <X size={24} />
            </button>
            
            {media.length > 1 && (
              <button
                className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10 transition-colors",
                  isRtl ? "right-4" : "left-4"
                )}
                onClick={prev}
                title={t("feed.prevMedia")}
              >
                {isRtl ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
              </button>
            )}

            {isVideo(currentMedia) ? (
              <video
                src={normalizeMediaUrl(currentMedia.url)}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img
                src={normalizeMediaUrl(currentMedia.url)}
                alt={t("feed.previewAlt")}
                loading="lazy"
                decoding="async"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              />
            )}

            {media.length > 1 && (
              <button
                className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-black/50 z-10 transition-colors",
                  isRtl ? "left-4" : "right-4"
                )}
                onClick={next}
                title={t("feed.nextMedia")}
              >
                {isRtl ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
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
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div 
      className="flex justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-700/50"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="flex gap-7">
        <button
          onClick={onLike}
          className="flex flex-col items-center transition-transform duration-200 ease-in-out"
          title={liked ? t("feed.unlikeBtn") : t("feed.likeBtn")}
          aria-label={liked ? t("feed.unlikeBtn") : t("feed.likeBtn")}
        >
          {liked ? (
            <HeartIcon className="w-6 h-6 text-blue-700 fill-blue-700 hover:text-blue-500 hover:scale-125 hover:rotate-12 transition-all duration-500" />
          ) : (
            <HeartIcon className="w-6 h-6 text-slate-400 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 scale-100 transition-all duration-300" />
          )}
        </button>

        <button
          onClick={onComment}
          className="group transition-transform active:scale-110 focus:outline-none"
          title={t("feed.commentBtn")}
          aria-label={t("feed.commentBtn")}
        >
          <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-all duration-300 ease-out" />
        </button>
        
        <button
          onClick={onShare}
          className="group transition-transform active:scale-110"
          title={t("feed.shareBtn")}
          aria-label={t("feed.shareBtn")}
        >
          <Share2 className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      <button 
        onClick={onSave}
        title={saved ? t("feed.unsaveBtn") : t("feed.saveBtn")}
        aria-label={saved ? t("feed.unsaveBtn") : t("feed.saveBtn")}
      >
        {saved ? (
          <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400 scale-100 hover:scale-110 transition-all duration-500" />
        ) : (
          <Bookmark className="w-5 h-5 text-slate-400 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 scale-100 transition-all duration-300" />
        )}
      </button>
    </div>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const hasMedia = post.mediaUrLs && post.mediaUrLs.length > 0;
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);


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
    toast(t("postCard.deleteSuccess"), {
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

  const shareToX = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareDesc}`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    setShareModalOpen(false);
  };

  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: followUser,

    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["PostDetails"] });

      const previousPosts = queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);

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
                  ? { ...p, isFollowedByCurrentUser: !p.isFollowedByCurrentUser }
                  : p,
              ),
            },
          })),
        };
      });

      // Optimistic update: PostDetails cache
      const feedPost = queryClient
        .getQueryData<InfiniteData<PostsResponse>>(["posts"])
        ?.pages.flatMap((p) => p.data.items)
        .find((p) => p.userId === userId);

      if (feedPost) {
        const currentPost = queryClient.getQueryData<PostDetails>(["PostDetails", feedPost.id]);
        if (currentPost) {
          queryClient.setQueryData<PostDetails>(["PostDetails", feedPost.id], {
            ...currentPost,
            isFollowedByCurrentUser: !currentPost.isFollowedByCurrentUser,
          });
        }
      }

      return { previousPosts };
    },

    onSuccess: (_data, userId) => {
      const feedPost = queryClient
        .getQueryData<InfiniteData<PostsResponse>>(["posts"])
        ?.pages.flatMap((p) => p.data.items)
        .find((p) => p.userId === userId);

      if (feedPost) {
        const currentPost = queryClient.getQueryData<PostDetails>(["PostDetails", feedPost.id]);
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

    onSettled: () => { },
  });

  function handleFollow() {
    followMutation.mutate(post.userId);
  }


  const shareUrl = `${window.location.origin}/post/${post.id}`;
  const shareTitle = isRtl ? `رحلة ${post.userName} على رحّال` : `${post.userName}'s trip on RAHHAL`;
  const shareDesc = post.description || (isRtl ? "شوف المغامرة دي!" : "Check out this adventure!");

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n${shareDesc}\n\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareModalOpen(false);
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    setShareModalOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("postCard.copySuccess"), {
        icon: <CopyCheck className="w-5 h-5 text-green-400" />,
        style: {
          borderRadius: "15px",
          background: "#1e293b",
          color: "#fff",
          fontWeight: "500",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        },
      });
    } catch {
      toast.error(t("postCard.copyFailed"));
    }
    setShareModalOpen(false);
  };

  const shareToOther = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDesc,
          url: shareUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          toast.error(t("postCard.shareFailed"));
        }
      }
    } else {
      copyLink();
    }
    setShareModalOpen(false);
  };

  return (
    <div
      className="w-full max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-6 border border-transparent dark:border-slate-700/60 transition-colors"
      dir={isRtl ? "rtl" : "ltr"}
    >
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
        post={post}
      />

      {!hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 py-8 text-lg font-medium wrap-break-word leading-relaxed text-slate-900 dark:text-slate-100"
        />
      )}

      {hasMedia && <PostMedia media={post.mediaUrLs} />}

      <PostActions
        liked={post.isLiked ?? false}
        saved={post.isSaved ?? false}
        onLike={handleLike}
        onSave={handleSave}
        onComment={() => setCommentsOpen(true)}
        onShare={() => setShareModalOpen(true)}
      />

      {(post.likes ?? 0) > 0 && (
        <div
          onClick={() => setOpenLikes(true)}
          className="px-4 text-sm font-semibold mt-1 cursor-pointer text-slate-900 dark:text-slate-100 transition-colors"
        >
          {post.likes} {t("feed.likesCount")}
        </div>
      )}

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
              className={cn(
                "absolute top-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors",
                isRtl ? "left-3" : "right-3"
              )}
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
              {t("postCard.likesTitle")}
            </h3>

            <LikesList type="post" id={post.id} />
          </div>
        </div>
      )}

      {hasMedia && (
        <PostContent
          description={post.description}
          className="px-4 mt-1 text-sm leading-relaxed wrap-break-word text-slate-800 dark:text-slate-200"
        />
      )}

      {(post.comments ?? 0) > 0 && (
        <div
          className="px-4 pb-3 text-sm text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          onClick={() => setCommentsOpen((prev) => !prev)}
        >
          {commentsOpen
            ? t("postCard.hideComments")
            : post.comments === 1
              ? t("postCard.viewComment")
              : (isRtl ? `عرض كل التعليقات (${post.comments})` : `View all ${post.comments} comments`)
          }
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
    post={post}
    onCancel={() => setEditModalOpen(false)}
  />
      )}

      {/* 🚀 Premium Share Modal (iOS / TikTok Style) */}
      {shareModalOpen && (
        <div
          onClick={() => setShareModalOpen(false)}
          // في الموبايل بيبقى تحت (items-end) وفي الشاشات الكبيرة بيبقى في النص (sm:items-center)
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 transition-all duration-300 animate-in fade-in"
        >
          <div
            // حواف دائرية كبيرة من فوق في الموبايل عشان تدي شكل الـ Bottom Sheet
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {isRtl ? "مشاركة عبر..." : "Share via..."}
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Share Options - Grid Layout */}
            <div className="p-6 flex flex-wrap justify-center gap-5">

              {/* WhatsApp */}
              <button onClick={shareToWhatsApp} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <MessageCircle size={28} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isRtl ? "واتساب" : "WhatsApp"}
                </span>
              </button>

              {/* Facebook */}
              <button onClick={shareToFacebook} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Facebook size={28} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isRtl ? "فيسبوك" : "Facebook"}
                </span>
              </button>

              <button onClick={shareToX} className="flex flex-col items-center gap-2 group w-[72px]">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-7 h-7 fill-currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isRtl ? "إكس" : "X"}
                </span>
              </button>

              {/* Copy Link */}
              <button onClick={copyLink} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-slate-700 group-hover:text-white dark:group-hover:bg-slate-600 transition-all duration-300 shadow-sm">
                  <LinkIcon size={28} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isRtl ? "نسخ" : "Copy"}
                </span>
              </button>

              {/* Other Options */}
              <button onClick={shareToOther} className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Share2 size={28} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {isRtl ? "المزيد" : "More"}
                </span>
              </button>

            </div>

            {/* Quick URL Copy Box */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="truncate flex-1 text-xs text-slate-500 px-3 font-medium" dir="ltr">
                  {shareUrl}
                </div>
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  {isRtl ? "نسخ" : "Copy"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
