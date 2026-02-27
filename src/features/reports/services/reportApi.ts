import axios from "axios";
import type { ReportType } from "../types";
import { BASE_URL } from "../../../utils/constant";
axios.defaults.baseURL = BASE_URL;
export const fetchReportsByType = async (
  type: ReportType,
  pageIndex: number,
  pageSize: number
) => {
  const endpoints: Record<ReportType, string> = {
    comments: `${BASE_URL}/Report/GetAllCommentReport`,
    posts: `${BASE_URL}/Report/PostReports`,
    users: `${BASE_URL}/Report/GetAllUserReport`,
  };

  const token = localStorage.getItem("token"); 

  const { data } = await axios.get(endpoints[type], {
    params: { pageIndex, pageSize },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("Fetched reports:", data);
  return data.data ?? [];
};