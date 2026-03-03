import { BASE_URL } from "../../../utils/constant";
import { getToken } from "../../../utils/getToken";

export async function removeParticipant({
  conversationId,
  profileId,
}: {
  conversationId: string;
  profileId: string;
}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/Chat/RemoveParticipant`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      conversationId,
      profileId,
    }),
  });
  if (!res.ok) throw new Error("Failed to remove participant");

  const data = await res.json();

  if (!data.isSuccess) throw new Error(data.message);

  return data;
}
