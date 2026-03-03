import { BASE_URL } from "../../../utils/constant";
import { getToken } from "../../../utils/getToken";

export async function getChatDetails({
  conversationId,
}: {
  conversationId: string;
}) {
  const token = getToken();
  const res = await fetch(
    `${BASE_URL}/Chat/GetChatDetails?conversationId=${conversationId}`,
    {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer  ${token}` : "",
      },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch chat");

  const data = await res.json();

  if (!data.isSuccess) throw new Error(data.message);
  return data;
}
