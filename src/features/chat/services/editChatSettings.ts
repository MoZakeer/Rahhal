import { BASE_URL } from "@/utils/constant";
import { getToken } from "@/utils/getToken";

export async function editChatSetting({
  conversationId,
  name,
  description,
  avatar,
}: {
  conversationId: string;
  name: string;
  description: string;
  avatar?: File | null;
}) {
  const token = getToken();
  const formData = new FormData();
  formData.append("ConversationId", conversationId);
  formData.append("Title", name);
  formData.append("Description", description);
  if (avatar) formData.append("ConversationPictureFile", avatar);

  const res = await fetch(`${BASE_URL}/Chat/EditChatDetails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("filed to send message");
  const data = await res.json();
  return data;
}
