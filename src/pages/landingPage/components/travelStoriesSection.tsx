import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PostCard from "../../../features/post/components/PostCard";
import type { Post, PostsResponse } from "../../../types/post";
import { getAllPosts } from "../../../features/post/components/services/posts.api";

interface Props {
  onPostDeleted?: (id: string) => void;
}

export default function TravelStoriesSection({ onPostDeleted }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response: PostsResponse = await getAllPosts();
        setPosts(response.data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (onPostDeleted) onPostDeleted(id);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading)
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-500">Loading posts...</p>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </section>
    );

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-primary-600)]">
              Travel Stories
            </h2>
            <p className="text-sm text-[var(--color-gray-500)] mt-1">
              Community
            </p>
          </div>

          <button
            onClick={() => navigate("/feed")}
            className="text-[var(--color-primary-600)] text-sm font-medium hover:underline"
          >
            View feed →
          </button>
        </div>

        {/* Slider */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 
                       bg-white shadow-md rounded-full p-2 
                       hover:bg-gray-100 transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 
                       bg-white shadow-md rounded-full p-2 
                       hover:bg-gray-100 transition"
          >
            <ChevronRight size={20} />
          </button>

          {/* Gradient Left */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 
                          bg-gradient-to-r from-white to-transparent z-10" />

          {/* Gradient Right */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 
                          bg-gradient-to-l from-white to-transparent z-10" />

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth px-10 py-4
                       [&::-webkit-scrollbar]:hidden"
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="min-w-[300px] max-w-[300px] flex-shrink-0"
              >
                <PostCard
                  post={post}
                  onPostDeleted={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

