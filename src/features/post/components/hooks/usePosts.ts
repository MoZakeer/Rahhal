import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPosts, likePost, savePost, deletePost } from "../services/posts.api";
import type { PostsResponse } from "../../../../types/post";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
}
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePost,

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts =
        queryClient.getQueryData<PostsResponse>(["posts"]);

      queryClient.setQueryData<PostsResponse>(["posts"], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    isLiked: !p.isLiked,
likes: p.isLiked ? (p.likes ?? 0) - 1 : (p.likes ?? 0) + 1                  }
                : p
            ),
          },
        };
      });

      return { previousPosts };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
export function useSavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePost,

    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData<PostsResponse>(["posts"]);

      queryClient.setQueryData<PostsResponse>(["posts"], (old) => {
        if (!old) return old;

        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((p) =>
              p.id === postId
                ? { ...p, isSaved: !p.isSaved }
                : p
            ),
          },
        };
      });

      return { previousPosts };
    },

    onError: (_err, _postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}