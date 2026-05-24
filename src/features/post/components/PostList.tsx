import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useCallback, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { getPostsInfinite } from "../../post/components/services/posts.api";
import PostCard from "../components/PostCard";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/context/LanguageContext";
import { RefreshCcw } from "lucide-react";

export default function PostsList() {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  
  usePageTitle(t("feed.pageTitle") || "Travel Stories");
  
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

  // OPTIMIZATION: Memoize the posts array to prevent unnecessary flattening on every render
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data?.items ?? []) ?? [];
  }, [data]);

  if (isLoading)
    return (
      <div className="space-y-8 dark:opacity-60 transition-opacity px-4 max-w-3xl mx-auto w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
               <Skeleton circle width={40} height={40} />
               <div className="flex-1">
                 <Skeleton width="40%" height={16} />
                 <Skeleton width="20%" height={12} className="mt-1" />
               </div>
             </div>
             <Skeleton height={200} borderRadius={16} />
          </div>
        ))}
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50 dark:bg-rose-500/10 rounded-3xl mx-4 max-w-3xl md:mx-auto mt-4 border border-rose-100 dark:border-rose-500/20">
        <p className="text-rose-600 dark:text-rose-400 font-bold mb-4">
          {t("feed.loadError") || "Oops! Something went wrong loading posts."}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold rounded-full transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          {t("feed.retry") || "Retry"}
        </button>
      </div>
    );

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center mx-4 max-w-3xl md:mx-auto mt-4 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          {t("feed.noPostsYet") || "No travel stories to show right now."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 px-4" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostRef : null}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }} // margin helps animate slightly before it fully enters
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PostCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>

      {isFetchingNextPage && (
        <div className="space-y-8 dark:opacity-60 transition-opacity">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
               <Skeleton circle width={40} height={40} />
               <div className="flex-1">
                 <Skeleton width="40%" height={16} />
               </div>
             </div>
             <Skeleton height={200} borderRadius={16} />
          </div>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-block px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/80 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("feed.endOfFeed") || "You've caught up with all the stories!"}
          </div>
        </div>
      )}
    </div>
  );
}