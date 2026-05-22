import { BASE_URL } from "@/utils/constant";
import { getToken } from "@/utils/getToken";

type ReactToMessagePayload = {
  messageId: string;
  emoji: string;
};

export async function reactToMessage({
  messageId,
  emoji,
}: ReactToMessagePayload) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/Chat/React?messageId=${messageId}&emoji=${encodeURIComponent(
      emoji,
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to react to message");
  }

  return res.json();
}
