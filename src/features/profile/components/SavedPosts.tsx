import { useEffect, useState } from "react";
import axios from "axios";

interface SavedPost {
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
  mediaUrLs: {
    id: string;
    url: string;
  }[];
}

interface Props {
  profileId: string;
  isMyProfile: boolean;
}

const SavedPosts: React.FC<Props> = ({ isMyProfile }) => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(false);

  const getSavedPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://rahhal-api.runasp.net/Post/GetSavedPosts",
        {
          params: {
            PageNumber: 1,
            PageSize: 10,
            SortByLastAdded: true,
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
      console.error("Error fetching saved posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMyProfile) {
      getSavedPosts();
    }
  }, [isMyProfile]);

  if (!isMyProfile) return null;

  if (loading) {
    
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 animate-pulse rounded-xl h-60 w-full"
          ></div>
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
    <div className="space-y-6 min-h-75">
      {posts.map((post) => (
        <div
          key={post.savedPostId}
          className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <img
              src={post.profileUrl}
              className="w-10 h-10 rounded-full object-cover"
              alt="profile"
            />
            <span className="font-semibold text-gray-800">{post.userName}</span>
          </div>

          {/* Description */}
          {post.description && (
            <p className="mb-3 text-gray-700">{post.description}</p>
          )}

          {/* Media */}
          {post.mediaUrLs?.length > 0 && (
            <img
              src={post.mediaUrLs[0].url}
              className="w-full rounded-lg object-cover max-h-100"
              alt="post"
            />
          )}

          {/* Footer */}
          <div className="flex gap-6 text-sm text-gray-500 mt-3">
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedPosts;