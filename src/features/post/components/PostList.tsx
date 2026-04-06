import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import { getPostsInfinite } from "../../post/components/services/posts.api";
import PostCard from "../components/PostCard";
import { motion, AnimatePresence } from "framer-motion";

export default function PostsList() {
  const observer = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPostsInfinite(pageParam as number, 10, true),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.pageIndex < lastPage.data.pages
        ? lastPage.data.pageIndex + 1
        : undefined,
  });

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
        },
        { rootMargin: "400px" },
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  // قللنا سطوع الـ Skeleton في الدارك مود عشان ميوجعش العين
  if (isLoading)
    return (
      <div className="space-y-8 dark:opacity-60 transition-opacity">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={300} borderRadius={32} />
        ))}
      </div>
    );

  // ظبطنا لون رسالة الخطأ
  if (isError)
    return (
      <div className="p-10 text-center text-rose-500 dark:text-rose-400 font-bold">
        Failed to load adventures.
      </div>
    );

  const posts = data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];

  return (
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostRef : null}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>

      {isFetchingNextPage && (
        <div className="space-y-8 dark:opacity-60 transition-opacity">
          <Skeleton height={300} borderRadius={10} />
        </div>
      )}
    </div>
  );
}
