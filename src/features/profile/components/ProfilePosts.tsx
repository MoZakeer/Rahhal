import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "../../../types/post";
import PostCardSkeleton from "../skeletons/PostCardSkeleton"; 
import ProfilePostCard from "./ProfilePostCard";

interface Props {
  profileId: string;
}

const ProfilePosts = ({ profileId }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const getUserPosts = async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://rahhal-api.runasp.net/Post/GetUserPosts?UserId=${profileId}&PageNumber=1&PageSize=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json(); 
      if (data?.isSuccess) {
        setPosts(data.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserPosts();
  }, [profileId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-16 text-center shadow-sm w-full max-w-2xl">
          <span className="text-5xl block mb-4">📸</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">No Posts Shared</h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">When this traveler shares their journey, it will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full "> 
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
            <div className=" ">
              <ProfilePostCard post={post} />
            </div>
          </motion.div>
        ))}
      </div>

     
      {/* {posts.length > 0 && (
        <div className="mt-12 mb-20 text-center">
          <div className="h-px w-full bg-gray-100 dark:bg-zinc-800 relative">
            <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-[#f8f9fa] dark:bg-zinc-950 px-4 text-xs text-gray-400 font-medium tracking-widest uppercase">
              End of Gallery
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProfilePosts;