import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../services/postApi";

export const usePostDetails = (id: string) => {
  return useQuery({
    queryKey: ["post-details", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
};

