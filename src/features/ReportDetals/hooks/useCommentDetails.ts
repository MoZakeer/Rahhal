import { useQuery } from "@tanstack/react-query";
import { getCommentById } from "../services/commentApi";

export const useCommentDetails = (id: string) => {
  return useQuery({
    queryKey: ["comment-details", id],
    queryFn: () => getCommentById(id),
    enabled: !!id,
  });
};