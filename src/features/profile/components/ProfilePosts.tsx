import { useEffect, useState } from "react";
import axios from "axios";
import PostCard from "../../post/components/PostCard";
// import { getUserId } from "../../../utils/auth";
import type { Post } from "../../../types/post";

interface Props {
  profileId: string;
}

const ProfilePosts = ({ profileId }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  // const currentUserId = getUserId();

  const getUserPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://rahhal-api.runasp.net/Post/GetUserPosts`,
        {
          params: {
            UserId: profileId,
            PageNumber: 1,
            PageSize: 20,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.isSuccess) {
        setPosts(res.data.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) getUserPosts();
  }, [profileId]);

  return (
    <div className="min-h-[75vh]">
      {loading && (
        <div className="flex justify-center py-10">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex justify-center py-16">
          <div
            className="w-full max-w-md bg-linear-to-br from-gray-50 to-gray-100 
                       border border-dashed border-gray-300 
                       rounded-2xl p-10 text-center shadow-sm 
                       transition-all duration-300 hover:shadow-md"
          >
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 flex items-center justify-center 
                           bg-white rounded-full shadow-sm text-2xl"
              >
                📷
              </div>
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              No Posts Yet
            </h2>

            <p className="text-gray-500 mt-2 text-sm">
              When this user shares posts, they will appear here.
            </p>
          </div>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="max-w-full">
              <PostCard
                post={post}
                // onPostDeleted={() => {
                //   setPosts((prev) => prev.filter((p) => p.id !== post.id));
                // }}
                // لو حبيتي ممكن تعمل نسخة صغيرة للكارد
                // عن طريق تعديل الـ padding أو font-size داخل PostCard
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;