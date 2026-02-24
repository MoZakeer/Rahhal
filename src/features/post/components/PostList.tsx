import { useEffect, useState } from "react";
import { getAllPosts } from "../../post/components/services/posts.api";
import type { Post } from "../../../types/post";
import PostCard from "../components/PostCard";
import Spinner from "../../../shared/components/Spinner";

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPosts() {
    setLoading(true);
    setError(null);

    try {
      const res = await getAllPosts();

      if (res.isSuccess) {
        setPosts(res.data.items ?? []);
      } else {
        setError(res.message || "Failed to load posts");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);


  function handleRemovePost(postId: string) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {loading ? (
        <div className="flex flex-col items-center my-20">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center my-4">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 my-4">No posts available.</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={handleRemovePost}
          />
        ))
      )}
    </div>
  );
}
