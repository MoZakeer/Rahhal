import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import { getPosts } from "../../post/components/services/posts.api";
import PostCard from "../components/PostCard";

export default function PostsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,

    select: (data) => ({
      ...data,
      data: {
        ...data.data,
        items: [...(data.data.items ?? [])].sort(
          (a, b) =>
            new Date(b.createdDate ?? 0).getTime() -
            new Date(a.createdDate ?? 0).getTime()
        ),
      },
    }),

    staleTime: 1000 * 60, // 1 minute cache
  });

  const posts = data?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} height={300} className="rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-red-500">
        Failed to load posts
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}