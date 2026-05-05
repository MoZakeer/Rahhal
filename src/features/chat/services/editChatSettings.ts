import { BASE_URL } from "@/utils/constant";
import { getToken } from "@/utils/getToken";

export async function editChatSetting({
  conversationId,
  name,
  description,
  avatar,
  isPictureDeleted,
}: {
  conversationId: string;
  name: string;
  description: string;
  avatar?: File | null;
  isPictureDeleted?: boolean;
}) {
  const token = getToken();
  const formData = new FormData();

  formData.append("ConversationId", conversationId);
  formData.append("Title", name);
  formData.append("Description", description);

  if (avatar) {
    formData.append("ConversationPictureFile", avatar);
    formData.append("IsPictureDeleted", "false");
  }
  else if (isPictureDeleted) {
    formData.append("IsPictureDeleted", "true");
  }

  const res = await fetch(`${BASE_URL}/Chat/EditChatDetails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to update chat settings");

  return await res.json();
}
