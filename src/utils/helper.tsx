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
export function parseMessageContent(text: string) {
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

  return text.split(urlRegex).map((part, index) => {
    if (/^(?:https?:\/\/|www\.)/.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;

      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all hover:text-blue-300 transition"
        >
          {part}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}
export function formatLastMessageDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Yesterday";
  }

  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return date.toLocaleDateString([], {
      weekday: "long",
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year:"numeric",
  });
}
