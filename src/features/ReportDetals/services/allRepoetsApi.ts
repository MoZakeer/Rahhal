
import { apiClient } from "./apiClient";
import type { ReportApiResponse } from "../types/reportDetails";

export const getCommentReports = async (
  id: string
): Promise<ReportApiResponse> => {
  const { data } = await apiClient.get<ReportApiResponse>(
    "/Report/AllReportsOnComment",
    {
      params: { CommentId: id },
    }
  );

  return data;
};

export const getPostReports = async (
  id: string
): Promise<ReportApiResponse> => {
  const { data } = await apiClient.get<ReportApiResponse>(
    "/Report/ReportsOnPost",
    {
      params: { PostId: id },
    }
  );

  return data;
};

export const getUserReports = async (
  id: string
): Promise<ReportApiResponse> => {
  const { data } = await apiClient.get<ReportApiResponse>(
    "/Report/AllReportsOnUser",
    {
      params: { ProfileId: id },
    }
  );

  return data;
};