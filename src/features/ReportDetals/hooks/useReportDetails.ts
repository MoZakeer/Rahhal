import { useQuery } from "@tanstack/react-query";
import { getCommentReports, getPostReports, getUserReports } from "../services/allRepoetsApi";

export const useReportDetails = (type: string, id: string) => {
  return useQuery({
    queryKey: ["report-details-list", type, id],
    queryFn: async () => {
      if (!id) return null;

      switch (type) {
        case "comments":
          return getCommentReports(id);
        case "posts":
          return getPostReports(id);
        case "users":
          return getUserReports(id);
        default:
          console.warn("Invalid report type", type);
          return null;
      }
    },
    enabled: !!type && !!id,
  });
};