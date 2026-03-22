import { Heart, MessageCircle, Bookmark } from "lucide-react";
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

  const shortDescription =
    post.description?.length > 60
      ? post.description.slice(0, 60) + "..."
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
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="group cursor-pointer bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        {/* Top actions: Like & Save */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={handleLike}
            className="bg-white/90 p-1.5 rounded-full shadow hover:scale-110 transition"
          >
            <Heart
              size={18}
              className={post.isLiked ? "text-red-500 fill-red-500" : "text-gray-600"}
            />
          </button>

          <button
            onClick={handleSave}
            className="bg-white/90 p-1.5 rounded-full shadow hover:scale-110 transition"
          >
            <Bookmark
              size={18}
              className={post.isSaved ? "text-indigo-600 fill-indigo-600" : "text-gray-600"}
            />
          </button>
        </div>

        {/* overlay: Likes & Comments */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white text-sm font-semibold">
          <div className="flex items-center gap-1">
            <Heart size={18} />
            {post.likes}
          </div>

          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            {post.comments}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-center">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {post.authorUsername || post.userName} {/* هنا الاسم */}
        </p>

        {shortDescription && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {shortDescription}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePostCard;