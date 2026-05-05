import { BASE_URL } from "@/utils/constant";
import { getToken } from "@/utils/getToken";

export async function deleteMessage(messageId: string) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/Chat/DeleteMessage?messageId=${messageId}`,
    {
      method: "DELETE", 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to delete message");
  }

  return res.json();
}
