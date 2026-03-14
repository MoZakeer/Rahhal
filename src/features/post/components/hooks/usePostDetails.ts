import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { PostDetails, PostsResponse } from "../../../../types/post";
import { followUser, likePost, savePost, deletePost } from "../services/posts.api";
import type { InfiniteData } from "@tanstack/react-query";

interface PostContext {
  previousPost?: PostDetails;
  previousPosts?: InfiniteData<PostsResponse>;
}

export const usePostDetailsActions = (postId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ─── LIKE ────────────────────────────────────────────────────────────────
  const likeMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: (id) => likePost(id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);
      const previousPosts =
        queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);

      // Optimistic update: PostDetails cache
      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likes: previousPost.isLiked
            ? Math.max(0, (previousPost.likes ?? 0) - 1)
            : (previousPost.likes ?? 0) + 1,
        });
      }

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

      return { previousPost, previousPosts };
    },

    onSuccess: () => {
      const currentPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);

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
                      isLiked: currentPost?.isLiked ?? p.isLiked,
                      likes: currentPost?.likes ?? p.likes,
                    }
                  : p
              ),
            },
          })),
        };
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Action failed");
    },

    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });

  // ─── SAVE ────────────────────────────────────────────────────────────────
  const saveMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: (id) => savePost(id),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);
      const previousPosts =
        queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);

      // Optimistic update: PostDetails cache
      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isSaved: !previousPost.isSaved,
        });
      }

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

      return { previousPost, previousPosts };
    },

    onSuccess: () => {
      const currentPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);

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
                      isSaved: currentPost?.isSaved ?? p.isSaved,
                    }
                  : p
              ),
            },
          })),
        };
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Action failed");
    },

    onSettled: () => {},
  });

  // ─── FOLLOW ──────────────────────────────────────────────────────────────
  const followMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: followUser,

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);
      const previousPosts =
        queryClient.getQueryData<InfiniteData<PostsResponse>>(["posts"]);

      // Optimistic update: PostDetails cache
      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isFollowedByCurrentUser: !previousPost.isFollowedByCurrentUser,
        });
      }

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
                p.userId === userId
                  ? {
                      ...p,
                      isFollowedByCurrentUser: !p.isFollowedByCurrentUser,
                    }
                  : p
              ),
            },
          })),
        };
      });

      return { previousPost, previousPosts };
    },

    onSuccess: (_data, userId) => {
      const currentPost = queryClient.getQueryData<PostDetails>([
        "PostDetails",
        postId,
      ]);

      queryClient.setQueryData<InfiniteData<PostsResponse>>(["posts"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((p) =>
                p.userId === userId
                  ? {
                      ...p,
                      isFollowedByCurrentUser:
                        currentPost?.isFollowedByCurrentUser ??
                        !p.isFollowedByCurrentUser,
                    }
                  : p
              ),
            },
          })),
        };
      });
    },

    onError: (_err, _userId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Action failed");
    },

    onSettled: () => {},
  });

  // ─── DELETE ──────────────────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: (id: string) => deletePost(id),

    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.removeQueries({ queryKey: ["PostDetails", postId] });
      navigate("/");
    },

    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  // ─── EXPORTS ─────────────────────────────────────────────────────────────
  const like = () => likeMutation.mutate(postId);
  const save = () => saveMutation.mutate(postId);
  const follow = (userId: string) => followMutation.mutate(userId);
  const remove = () => removeMutation.mutate(postId);

  return {
    like,
    save,
    follow,
    remove,
    isLiking: likeMutation.isPending,
    isSaving: saveMutation.isPending,
    isFollowing: followMutation.isPending,
  };
};