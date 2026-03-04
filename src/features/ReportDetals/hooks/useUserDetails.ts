import { useQuery } from "@tanstack/react-query";
import { getAllReportsOnUser } from "../services/uerApi";

export const useUserDetails = (id: string) => {
  return useQuery({
    queryKey: ["user-details", id],
    queryFn: () => getAllReportsOnUser(id),
    enabled: !!id,
  });
};