import { usePostDetails } from "../hooks/usePostDetails";
import { PostMedia } from "../../../features/post/components/PostCard";
import { PostContent } from "../../../features/post/components/PostContent";
import { normalizeMediaUrl } from "../../../features/post/components/services/posts.api";

interface Props {
  id: string;
}
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";
export default function ReportedPostCard({ id }: Props) {
  const { data, isLoading, isError } = usePostDetails(id);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading post</div>;

  if (!data?.isSuccess || !data.data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 text-center text-gray-500">
        Post not found or may have been deleted.
      </div>
    );
  }

  const post = data.data;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6 max-w-xl mx-auto">

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={normalizeMediaUrl(post.profileURL) || DEFAULT_AVATAR}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div className="flex flex-col leading-tight">
            <span className="font-semibold">
              {post.userName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(post.createdDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>


      {post.media_URLs?.length > 0 && (
        <PostMedia media={post.media_URLs} />
      )}
      <PostContent
        description={post.description}
          className="px-4 mt-1 text-sm leading-relaxed wrap-break-word text-slate-800 dark:text-slate-200"
      />

      <div className="px-4 pb-4 text-sm text-gray-500">
        {post.likes} likes • {post.comments} comments
      </div>
    </div>
  );
}