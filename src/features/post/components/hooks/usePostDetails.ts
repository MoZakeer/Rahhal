import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import type { PostDetails } from "../../../../types/post";
import { followUser } from "../services/posts.api";
import { likePost, savePost, deletePost } from "../services/posts.api";

interface PostContext {
  previousPost?: PostDetails;
}

export const usePostDetailsActions = (postId: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const likeMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: (id) => likePost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      const previousPost = queryClient.getQueryData<PostDetails>(["PostDetails", postId]);

      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likes: previousPost.isLiked 
            ? Math.max(0, (previousPost.likes ?? 0) - 1) 
            : (previousPost.likes ?? 0) + 1,
        });
      }
      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
      toast.error("Action failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["likes"] });

    },
  });

  const saveMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: (id) => savePost(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      const previousPost = queryClient.getQueryData<PostDetails>(["PostDetails", postId]);

      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isSaved: !previousPost.isSaved,
        });
      }
      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
        queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const followMutation = useMutation<void, Error, string, PostContext>({
    mutationFn: (userId) => followUser(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["PostDetails", postId] });
      const previousPost = queryClient.getQueryData<PostDetails>(["PostDetails", postId]);

      if (previousPost) {
        queryClient.setQueryData<PostDetails>(["PostDetails", postId], {
          ...previousPost,
          isFollowedByCurrentUser: !previousPost.isFollowedByCurrentUser,
        });
      }
      return { previousPost };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(["PostDetails", postId], context.previousPost);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // --- 4. DELETE MUTATION ---
  const removeMutation = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["PostDetails", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  return {
    like: () => likeMutation.mutate(postId),
    save: () => saveMutation.mutate(postId),
    follow: (userId: string) => followMutation.mutate(userId),
    remove: () => removeMutation.mutate(postId),
    isLiking: likeMutation.isPending,
    isSaving: saveMutation.isPending,
  };
};