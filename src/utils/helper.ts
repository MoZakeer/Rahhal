import { BASE_URL } from "./constant";

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
export function conversationImage({
  isGroup,
  conversationPictureURL,
  otherUserProfilePicture,
}: {
  isGroup: boolean;
  conversationPictureURL?: string | null;
  otherUserProfilePicture?: string | null;
}) {
  let src: string;

  if (conversationPictureURL) {
    src = conversationPictureURL;
  } else if (isGroup) {
    src = "/group-default.png";
  } else {
    src = otherUserProfilePicture || "/private-default.png";
  }

  if (src.startsWith("/uploads")) {
    return BASE_URL + src;
  }

  return src;
}
