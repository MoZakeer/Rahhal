import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getLikes } from "./services/likes.api";
import type { LikeUser } from "../../../types/post";
import { normalizeMediaUrl } from "./services/posts.api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  type: "post" | "comment";
  id: string;
}

export const LikesList = ({ type, id }: Props) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["likes", type, id],
    queryFn: ({ pageParam }) =>
      getLikes({
        type,
        id,
        pageNumber: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage.data.pageIndex;
      const total = lastPage.data.pages;
      return current < total ? current + 1 : undefined;
    },
  });

  const likes = data?.pages.flatMap((page) => page.data.items as LikeUser[]) ?? [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  const renderSkeleton = (count: number) => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2">
          <Skeleton circle height={44} width={44} containerClassName="shrink-0" />
          <Skeleton height={14} width={120} borderRadius={8} />
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="py-2 dark:opacity-80 transition-opacity">
        {renderSkeleton(4)}
      </div>
    );
  }

  if (!likes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
        <p className="text-[15px] font-medium">{t("feed.noLikes")}</p>
      </div>
    );
  }

  return (
    <div 
      className="max-h-[400px] overflow-y-auto space-y-1.5 max-w-[400px] pe-2 custom-scrollbar" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {likes.map((user) => (
        <button 
          onClick={() => navigate(`/profile/${user.profileId}`)}
          key={user.likeId}
          className="w-full text-start group flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <div className="relative shrink-0">
            <img
              src={
                user.profilePicture
                  ? normalizeMediaUrl(user.profilePicture)
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}&background=f1f5f9&color=0f172a&bold=true`
              }
              alt={user.userName}
              loading="lazy"
              decoding="async" 
              className="w-11 h-11 rounded-full object-cover border-2 border-transparent group-hover:border-red-100 dark:group-hover:border-slate-600 transition-colors"
            />
          </div>
          <span className="font-semibold text-[15px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
            {user.userName}
          </span>
        </button>
      ))}

      <div ref={loaderRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="pt-2 pb-1 dark:opacity-80 transition-opacity">
          {renderSkeleton(2)}
        </div>
      )}
    </div>
  );
};