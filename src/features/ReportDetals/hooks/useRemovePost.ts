// hooks/useRemovePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { rejectPostReport } from "../services/removePostApi";

export const useRemovePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => rejectPostReport(postId),

    onSuccess: (res) => {
      if (res.isSuccess) {

        queryClient.invalidateQueries({
          queryKey: ["report-details-list"],
          exact: false,
        });
      } else {
        toast.error(res.message || "Failed to remove post");
      }
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });
};