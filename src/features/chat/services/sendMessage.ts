import { BASE_URL } from "../../../utils/constant";
import { getToken } from "../../../utils/getToken";

export async function sendMessage({
  conversationId,
  content,
  files,
}: {
  conversationId: string;
  content: string;
  files: File[];
}) {
  const formData = new FormData();
  const token = getToken();
  formData.append("conversationId", conversationId);
  formData.append("Content", content);
  files.forEach((file: File) => formData.append("AttachmentFiles", file));

  const res = await fetch(`${BASE_URL}/Chat/SendMessage`, {
    method: "POST",
    headers: {
      Authorization: token ? `Bearer  ${token}` : "",
    },
    body: formData,
  });
  if (!res.ok) throw new Error("filed to send message");
  const data = await res.json();
  return data;
}
