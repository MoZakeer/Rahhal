// components/LikesList.tsx

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import { getLikes } from "./services/likes.api";
import type { LikeUser } from "../../../types/post";
import {  normalizeMediaUrl } from "./services/posts.api";
import { useNavigate } from "react-router-dom";

interface Props {
  type: "post" | "comment";
  id: string;
}

export const LikesList = ({ type, id }: Props) => {
  const loaderRef = useRef<HTMLDivElement | null>(null);

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
    const navigate = useNavigate();

  const likes =
    data?.pages.flatMap((page) => page.data.items as LikeUser[]) ?? [];

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

  if (isLoading) {
    return (
          <Skeleton  />
    );
  }

  if (!likes.length) {
    return <p className="text-gray-500 text-sm">No likes yet</p>;
  }

  return (
    
<div className="max-h-400 overflow-y-auto space-y-3 max-w-400">
          {likes.map((user) => (
        <div onClick={() => navigate(`/profile/${user.profileId}`)}
          key={user.likeId}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
        >
          <img
src={
  user.profilePicture
    ? normalizeMediaUrl(user.profilePicture)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName)}`
}
            alt={user.userName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-medium">{user.userName}</span>
        </div>
      ))}

      <div ref={loaderRef} />

      {isFetchingNextPage && (
        <Skeleton height={30} count={2} />
      )}
    </div>
  );
};