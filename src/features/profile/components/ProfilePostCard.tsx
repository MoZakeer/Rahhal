import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../../../types/post";
import { normalizeMediaUrl } from "../../post/components/services/posts.api";
import { useLikePost, useSavePost } from "../../post/components/hooks/usePosts";

interface Props {
  post: Post;
}

const ProfilePostCard = ({ post }: Props) => {
  const navigate = useNavigate();
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();

  const firstImage =
    post.mediaUrLs && post.mediaUrLs.length > 0
      ? normalizeMediaUrl(post.mediaUrLs[0].url)
      : null;

  // جعلنا الوصف أقصر قليلاً ليناسب الـ UI الجديد
  const shortDescription =
    post.description?.length > 50
      ? post.description.slice(0, 50) + "..."
      : post.description;

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    likeMutation.mutate(post.id);
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    saveMutation.mutate(post.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/post/${post.id}`)}
      className="group relative cursor-pointer bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Media Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50 dark:bg-slate-800">
        {firstImage ? (
          <img
            src={firstImage}
            alt={post.description}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ExternalLink size={24} strokeWidth={1.5} />
          </div>
        )}

        {/* Hover Overlay (Stats) */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
          <div className="flex items-center gap-1.5 font-bold">
            <Heart size={20} className="fill-white" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <MessageCircle size={20} className="fill-white" />
            <span>{post.comments}</span>
          </div>
        </div>

        {/* Quick Actions (Floating) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleLike}
            className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-xl shadow-lg hover:scale-110 transition active:scale-95"
          >
            <Heart
              size={18}
              className={
                post.isLiked
                  ? "text-red-500 fill-red-500"
                  : "text-gray-700 dark:text-gray-300"
              }
            />
          </button>
          <button
            onClick={handleSave}
            className="bg-white/90 dark:bg-slate-800/90 p-2 rounded-xl shadow-lg hover:scale-110 transition active:scale-95"
          >
            <Bookmark
              size={18}
              className={
                post.isSaved
                  ? "text-cyan-600 fill-cyan-600"
                  : "text-gray-700 dark:text-gray-300"
              }
            />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">
            {post.authorUsername || post.userName || "User"}
          </span>
        </div>

        {shortDescription && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {shortDescription}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePostCard;
