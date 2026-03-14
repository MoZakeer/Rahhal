import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPosts,
  likePost,
  savePost,
  deletePost,
} from "../services/posts.api";
import type { PostsResponse, PostDetails } from "../../../../types/post";
import type { InfiniteData } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
interface PostContext {
  previousPosts?: InfiniteData<PostsResponse>;
  previousPost?: PostDetails;
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
}

// ─── LIKE ────────────────────────────────────────────────────────────────────
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, PostContext>({
    mutationFn: likePost,

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });

      const previousPosts =
        queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);
      const previousPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);

      // Optimistic update: feed cache
      queryClient.setQueryData<InfiniteData<PostsResponse>>(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((p) =>
                p.id === postId
                  ? {
                      ...p,
                      isLiked: !p.isLiked,
                      likes: p.isLiked
                        ? Math.max(0, (p.likes ?? 0) - 1)
                        : (p.likes ?? 0) + 1,
                    }
                  : p
              ),
            },
          })),
        };
      });

      // ✅ Optimistic update: PostDetails cache
      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likes: previousPost.isLiked
            ? Math.max(0, (previousPost.likes ?? 0) - 1)
            : (previousPost.likes ?? 0) + 1,
        });
      }

      return { previousPosts, previousPost };
    },

    // ✅ Sync PostDetails cache with confirmed value from feed
    onSuccess: (_data, postId) => {
      const feedPost = queryClient
        .getQueryData<InfiniteData<PostsResponse>>(["posts"])
        ?.pages.flatMap((p) => p.data.items)
        .find((p) => p.id === postId);

      if (feedPost) {
        const currentPost = queryClient.getQueryData<PostDetails>([
          "PostDetails",
          postId,
        ]);
        if (currentPost) {
          queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
            ...currentPost,
            isLiked: feedPost.isLiked,
            likes: feedPost.likes,
          });
        }
      }
    },

    onError: (_err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
      toast.error("Action failed");
    },

    // ✅ No invalidation — manual sync handles everything
    // invalidateQueries(["posts"]) would trigger GetAll refetch which
    // corrupts isFollowedByCurrentUser with wrong value from backend
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });
}

// ─── SAVE ────────────────────────────────────────────────────────────────────
export function useSavePost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, PostContext>({
    mutationFn: savePost,

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });

      const previousPosts =
        queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);
      const previousPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);

      // Optimistic update: feed cache
      queryClient.setQueryData<InfiniteData<PostsResponse>>(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((p) =>
                p.id === postId
                  ? { ...p, isSaved: !p.isSaved }
                  : p
              ),
            },
          })),
        };
      });

      // ✅ Optimistic update: PostDetails cache
      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isSaved: !previousPost.isSaved,
        });
      }

      return { previousPosts, previousPost };
    },

    // ✅ Sync PostDetails cache with confirmed value from feed
    onSuccess: (_data, postId) => {
      const feedPost = queryClient
        .getQueryData<InfiniteData<PostsResponse>>(["posts"])
        ?.pages.flatMap((p) => p.data.items)
        .find((p) => p.id === postId);

      if (feedPost) {
        const currentPost = queryClient.getQueryData<PostDetails>([
          "PostDetails",
          postId,
        ]);
        if (currentPost) {
          queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
            ...currentPost,
            isSaved: feedPost.isSaved,
          });
        }
      }
    },

    onError: (_err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
      toast.error("Action failed");
    },

    // ✅ No invalidation
    onSettled: () => {},
  });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: (_, postId) => {
      // ✅ Safe to invalidate on delete — post is gone so
      // isFollowedByCurrentUser corruption no longer matters
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.removeQueries({ queryKey: ["PostDetails", postId] });
    },

    onError: () => {
      toast.error("Failed to delete post");
    },
  });
}