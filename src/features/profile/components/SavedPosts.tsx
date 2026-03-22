import { useEffect, useState } from "react";
import axios from "axios";
// import PostCard from "../../post/components/PostCard";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import type { Post, PostMediaItem } from "../../../types/post";
import ProfilePostCard from "./ProfilePostCard";

interface SavedPostAPI {
  savedPostId: string;
  postId: string;
  userId: string;
  userName: string;
  profileUrl: string;
  description: string;
  isLiked: boolean;
  isSaved: boolean;
  likes: number;
  comments: number;
  createdDate: string;
  mediaUrLs: PostMediaItem[];
}

interface Props {
  profileId: string;
  isMyProfile: boolean;
  baseUrl: string;
}

const SavedPosts: React.FC<Props> = ({ isMyProfile, baseUrl }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const getSavedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://rahhal-api.runasp.net/Post/GetSavedPosts", {
        params: { PageNumber: 1, PageSize: 20, SortByLastAdded: true },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.isSuccess) {
        const mappedPosts: Post[] = res.data.data.items.map((post: SavedPostAPI) => ({
          id: post.postId,
          postId: post.postId,
          savedPostId: post.savedPostId || null,
          authorUsername: post.userName,
          authorProfilePicture: post.profileUrl ? `${baseUrl}${post.profileUrl}` : "",
          createdAt: post.createdDate,
          description: post.description || "",
          mediaUrLs: post.mediaUrLs?.map((m) => ({
            id: m.id,
            url: m.url.startsWith("http") ? m.url : `${baseUrl}${m.url}`,
          })) || [],
          likes: post.likes,
          comments: post.comments,
          isLiked: post.isLiked,
          isSaved: post.isSaved,
          isFollowedByCurrentUser: false, // ممكن تعدلي لو عندك API يجيب info ده
          userId: post.userId,
          profileUrl: post.profileUrl,
        }));
        setPosts(mappedPosts);
      }
    } catch (error) {
      console.error("Error fetching saved posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMyProfile) getSavedPosts();
  }, [isMyProfile]);

  if (!isMyProfile) return null;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-full max-w-md bg-linear-to-br from-gray-50 to-gray-100 
                        border border-dashed border-gray-300 rounded-2xl p-10 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 flex items-center justify-center 
                            bg-white rounded-full shadow-sm text-2xl">
              🔖
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">No Saved Posts</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Posts you save will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
      {posts.map((post) => (
        <div key={post.id} className="max-w-full">
          <ProfilePostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default SavedPosts;