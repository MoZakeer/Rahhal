import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useCallback, useEffect } from "react"; // ضفنا useEffect هنا
import Skeleton from "react-loading-skeleton";
import { getPostsInfinite } from "../../post/components/services/posts.api";
import PostCard from "../components/PostCard";

export default function PostsList() {
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) =>
      getPostsInfinite(pageParam as number, 10, true),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      if (lastPage.data.pageIndex < lastPage.data.pages) {
        return lastPage.data.pageIndex + 1;
      }
      return undefined;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener("refreshFeed", handleRefresh);

    return () => {
      window.removeEventListener("refreshFeed", handleRefresh);
    };
  }, [refetch]);

  const posts =
    data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        {
          rootMargin: "300px",
        }
      );

      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

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
      <p className="text-center text-red-500">Failed to load posts</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {posts.map((post, index) => {
        if (index === posts.length - 1) {
          return (
            <div ref={lastPostRef} key={post.id}>
              <PostCard post={post} />
            </div>
          );
        }

        return <PostCard key={post.id} post={post} />;
      })}

      {isFetchingNextPage && (
        <Skeleton height={200} className="rounded-xl" />
      )}
    </div>
  );
}