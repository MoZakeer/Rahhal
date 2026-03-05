
import { useQuery } from "@tanstack/react-query";
import {
  getCommentReports,
  getPostReports,
  getUserReports,
} from "../services/allRepoetsApi";
import type { ReportDetail } from "../types/reportDetails";

export const useReportDetails = (type: string, id: string) => {
  return useQuery<ReportDetail[]>({
    queryKey: ["report-details-list", type, id],
    queryFn: async () => {
      if (!id) return [];

      let response;

      switch (type) {
        case "comments":
          response = await getCommentReports(id);
          return response.data.items ?? [];

        case "posts":
          response = await getPostReports(id);
          return response.data.reportInfo ?? [];

        case "users":
          response = await getUserReports(id);
          return response.data.items ?? [];

        default:
          console.warn("Invalid report type", type);
          return [];
      }
    },
    enabled: !!type && !!id,
  });
};