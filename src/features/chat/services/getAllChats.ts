import { BASE_URL } from "../../../utils/constant";
export async function getAllChats(token: string) {
  const res = await fetch(`${BASE_URL}/Chat/GetAll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res) throw new Error("Failed to fetch chats");
  const data = await res.json();
  if (!data.isSuccess) throw new Error(data.message);
  return data;
}
