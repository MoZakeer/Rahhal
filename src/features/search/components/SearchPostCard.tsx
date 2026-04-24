import { useNavigate } from "react-router-dom";
import { normalizeMediaUrl } from "@/features/post/components/services/posts.api";
type PostPreview = {
  postId: string;
  description: string;
  authorUsername: string;
  authorProfilePicture?: string | null;
  createdAt: string;
  mediaUrls?: string[];
};

export default function PostPreviewCard({ post }: { post: PostPreview }) {
  const navigate = useNavigate();

  const image = post.mediaUrls?.[0];

  function formatTime(date: string) {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return created.toLocaleDateString();
  }

  return (
    <div
      onClick={() => navigate(`/post/${post.postId}`)}
      className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
    >
      {/* MEDIA */}
      {image ? (
        <div className="relative">
          <img
            src={normalizeMediaUrl(image)}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 p-4 text-white w-full">
            {/* Author */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={normalizeMediaUrl(
                  post.authorProfilePicture ||
                    `https://ui-avatars.com/api/?name=${post.authorUsername}`,
                )}
                className="w-8 h-8 rounded-full object-cover border border-white/40"
              />

              <div className="text-xs">
                <p className="font-semibold">{post.authorUsername}</p>
                <p className="opacity-70">{formatTime(post.createdAt)}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm line-clamp-2 leading-snug">
              {post.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-4 flex flex-col  gap-4">
          {/* Author (top) */}
          <div className="flex items-center gap-2">
            <img
              src={normalizeMediaUrl(
                post.authorProfilePicture ||
                  `https://ui-avatars.com/api/?name=${post.authorUsername}`,
              )}
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {post.authorUsername}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {formatTime(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Description (bottom) */}
          <p className="text-lg text-slate-700 dark:text-slate-200 line-clamp-4 leading-snug">
            {post.description}
          </p>
        </div>
      )}
    </div>
  );
}
