import { BASE_URL } from "../../../utils/constant";

export async function getChatById({ token, chatId }) {
  const res = await fetch(
    `${BASE_URL}/Chat/GetChatById?conversationId=${chatId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch chat");

  const data = await res.json();

  if (!data.isSuccess) throw new Error(data.message);

  return data;
}
