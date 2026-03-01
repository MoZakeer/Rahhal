import { useQuery } from "@tanstack/react-query";
import { fetchReportsByType } from "../services/reportApi";
import type { ReportType } from "../types";

export const useReports = (
  type: ReportType,
  pageIndex: number,
  pageSize: number
) => {
  return useQuery({
    queryKey: ["reports", type, pageIndex, pageSize],
    queryFn: () => fetchReportsByType(type, pageIndex, pageSize),
  });
};