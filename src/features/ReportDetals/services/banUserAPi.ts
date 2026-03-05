import axios from "axios";

const BASE_URL = "https://rahhal-api.runasp.net";

export interface BanPayload {
  profileId: string;
  isBanned: boolean;
  durationInHours: number;
  targetType: number;
  targetId?: string;
}

export const banUser = async (payload: BanPayload): Promise<unknown> => {
  const userJS = localStorage.getItem("user");
  if (!userJS) throw new Error("No token found");

  const { token } = JSON.parse(userJS);

  const response = await axios.post(`${BASE_URL}/User/UpdateUserBan`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};