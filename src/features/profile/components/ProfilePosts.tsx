import { useEffect, useState } from "react";
import PostCard from "../../post/components/PostCard";
import type { Post } from "../../../types/post";
import PostCardSkeleton from "../skeletons/PostCardSkeleton"; 

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
      if (!token) {
        console.error("No token found!");
        return;
      }

      const res = await fetch(
        `https://rahhal-api.runasp.net/Post/GetUserPosts?UserId=${profileId}&PageNumber=1&PageSize=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json(); 
      console.log("Fetched posts:", data);

      if (data?.isSuccess) {
        setPosts(data.data.items || []);
      } else {
        console.error("Error fetching posts:", data?.message);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                        border border-dashed border-gray-300 rounded-2xl p-10 text-center shadow-sm 
                        transition-all duration-300 hover:shadow-md">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 flex items-center justify-center 
                            bg-white rounded-full shadow-sm text-2xl">
              📷
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-700">No Posts Yet</h2>
          <p className="text-gray-500 mt-2 text-sm">
            When this user shares posts, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="max-w-full">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default ProfilePosts;