
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { rejectCommentReport } from "../services/removeCommentApi"; 

export const useRemoveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => rejectCommentReport(commentId),

    onSuccess: (res) => {
      if (res.isSuccess) {
        queryClient.invalidateQueries({
          queryKey: ["report-details-list"],
          exact: false,
        });
      } else {
        toast.error(res.message || "Failed to remove comment");
      }
    },

    onError: () => {
      toast.error("Something went wrong");
    },
  });
};