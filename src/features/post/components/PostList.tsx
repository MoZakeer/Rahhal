import { getAllPosts } from "../../post/components/services/posts.api";
import PostCard from "../components/PostCard";
// import Spinner from "../../../shared/components/Spinner";
import Skeleton from "react-loading-skeleton";

import { useQuery } from "@tanstack/react-query";

export default function PostsList() {
 const { data, isLoading, isError } = useQuery({
  queryKey: ["posts"],
  queryFn: getAllPosts,
  select: (data) => {
    return {
      ...data,
      data: {
        ...data.data,
        items: [...(data.data.items ?? [])].sort(
          (a, b) =>
           new Date(b.createdDate ?? 0).getTime() -
          new Date(a.createdDate ?? 0).getTime()
        ),
      },
    };
  },
});

  const posts = data?.data.items ?? [];

  

  if (isLoading) return   (
    <div className="space-y-4">
      <Skeleton height={20} width={200} />
      <Skeleton height={15} count={3} />
      <Skeleton height={200} />
    </div>
  );;
  if (isError) return <p>Error loading posts</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}
    </div>
  );
}