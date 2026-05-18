import { BASE_URL } from "../../../utils/constant";

import { getToken } from "../../../utils/getToken";

type SendMessageProps = {
  conversationId: string;

  content: string;

  files: File[];

  parentMessageId?: string;
};

export async function sendMessage({
  conversationId,
  content,
  files,
  parentMessageId,
}: SendMessageProps) {
  const formData = new FormData();

  const token = getToken();

  formData.append("conversationId", conversationId);

  formData.append("Content", content);

  if (parentMessageId) {
    formData.append("ParentMessageId", parentMessageId);
  }

  files.forEach((file: File) => formData.append("AttachmentFiles", file));

  const res = await fetch(`${BASE_URL}/Chat/SendMessage`, {
    method: "POST",

    headers: {
      Authorization: token ? `Bearer  ${token}` : "",
    },

    body: formData,
  });

  if (!res.ok) throw new Error("Failed to send message");

  const data = await res.json();

  return data;
}
