// apiClient.ts
import axios from "axios";

const BASE_URL = "https://rahhal-api.runasp.net";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const userJS = localStorage.getItem("user");
  if (userJS) {
    const { token } = JSON.parse(userJS);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});