// services/reportApi.ts
import axios from "axios";

const BASE_URL = "https://rahhal-api.runasp.net";

function getTokenFromStorage() {
  const userJS = localStorage.getItem("user");
  if (!userJS) return null;
  const { token } = JSON.parse(userJS);
  return token;
}

export const getCommentReports = async (id: string) => {
  const token = getTokenFromStorage();
  if (!token) throw new Error("No token found");

  const { data } = await axios.get(`${BASE_URL}/Report/AllReportsOnComment`, {
    params: { CommentId: id },
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  return data;
};

export const getPostReports = async (id: string) => {
  const token = getTokenFromStorage();
  if (!token) throw new Error("No token found");

  const { data } = await axios.get(`${BASE_URL}/Report/ReportsOnPost`, {
    params: { PostId :id },
    headers: { Authorization: `Bearer ${token}`},
  });
  return data;
};

export const getUserReports = async (id: string) => {
  const token = getTokenFromStorage();
  if (!token) throw new Error("No token found");

  const { data } = await axios.get(`${BASE_URL}/Report/AllReportsOnUser`, {
    params: { ProfileId: id },
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });
  return data;
};