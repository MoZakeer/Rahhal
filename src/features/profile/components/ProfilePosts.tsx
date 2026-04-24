import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "../../../types/post";
import PostCardSkeleton from "../skeletons/PostCardSkeleton";
import ProfilePostCard from "./ProfilePostCard";
import { Plus } from "lucide-react";
import CreatePostModal from "@/features/post/components/createPostModal";
interface Props {
  profileId: string;
}

const ProfilePosts = ({ profileId }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const myProfileId = parsedAuth?.profileId || "";
  const isMyProfile = myProfileId === profileId;
  const getUserPosts = async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://rahhal-api.runasp.net/Post/GetUserPosts?UserId=${profileId}&PageNumber=1&PageSize=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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

  if (!loading && posts.length === 0 && !isMyProfile) {
    return (
      <div className="w-full flex justify-center py-20">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] p-16 text-center shadow-sm w-full max-w-2xl">
          <span className="text-5xl block mb-4">📸</span>
          <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">
            No Posts Shared
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 mt-2">
            When this traveler shares their journey, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full ">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {isMyProfile && (
          <div className="flex justify-center w-full  aspect-[4/3] h-80">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div
                onClick={() => setIsModalOpen(true)}
                className="group relative cursor-pointer h-full flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* soft hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* icon */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-7 h-7 stroke-[2.5px]" />
                  </div>
                </div>

                {/* text */}
                <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                  Create Post
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 text-center px-6">
                  Share a moment from your journey
                </p>
              </div>
            </div>
          </div>
        )}
        <CreatePostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{
              y: -5,
              zIndex: 10,
              transition: { duration: 0.2 },
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
