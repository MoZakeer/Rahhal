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
 
  return data.data ;
};
export const createPostReport = (postId: string, type: string, description: string) =>
  axios.post(`${BASE_URL}/Report/ReportPost`, {
    postId,
    type,
    description,
  },{headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },}
);

export const createCommentReport = async (
  profileId: string,
  commentId: string,
  type: string,
  description: string
) => {
  const response = await axios.post(
    `${BASE_URL}/Report/CreateCommentReport`,
    {
      profileId,
      commentId,
      type,
      description,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  

  return response.data;
};

export const createUserReport = (
  reporterId: string,
  reportedUserId: string,
  messageId: string,
  type: string,
  description: string
) =>
  axios.post(`${BASE_URL}/Report/CreateUserReport`, {
    reporterId,
    reportedUserId,
    messageId,
    type,
    description,
  },{headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },});