import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // ضفنا الأنيميشن لتوحيد التجربة
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
          isFollowedByCurrentUser: false,
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

  // 1. Loading State: Matching ProfilePosts Grid
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 2. Empty State: Matching ProfilePosts Style
  if (!loading && posts.length === 0) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-16 text-center shadow-sm w-full max-w-2xl">
          <span className="text-5xl block mb-4">🔖</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">No Saved Posts</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">
            When you save a journey, it will appear here for you to explore again.
          </p>
        </div>
      </div>
    );
  }

  // 3. Final Grid: Exact match to ProfilePosts (Layout + Motion)
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ 
              y: -5, 
              zIndex: 10,
              transition: { duration: 0.2 }
            }} 
            className="w-full group relative"
          >
            <ProfilePostCard post={post} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedPosts;