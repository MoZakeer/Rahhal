import type { IconType } from "react-icons";
import { HiOutlinePhoto, HiOutlineVideoCamera } from "react-icons/hi2";
import { MessageType } from "@/features/chat/types/MessageType";

type ReactionInfo = {
  reacterName: string;

  emoji: string;
};
type Props = {
  lastMessageContent: string;

  lastMessageType?: number;

  reactionInfo?: ReactionInfo | null;

  currentUserName?: string;
};
type SidebarPreview = {
  isReaction: boolean;

  icon: IconType | null;

  text: string;
};
function getMessageTypeLabel(type?: number) {
  switch (type) {
    case MessageType.Image:
      return "Photo";

    case MessageType.Video:
      return "Video";

    default:
      return null;
  }
}
export function getSidebarMessagePreview({
  lastMessageContent,
  lastMessageType,
  reactionInfo,
  currentUserName,
}: Props): SidebarPreview {
  const messageTypeLabel = getMessageTypeLabel(lastMessageType);
  const messageLabel = messageTypeLabel ?? lastMessageContent ?? "Message";
  if (reactionInfo) {
    const isCurrentUser = reactionInfo.reacterName === currentUserName;
    return {
      isReaction: true,
      icon: null,
      text: isCurrentUser
        ? `You reacted ${reactionInfo.emoji} to "${messageLabel}"`
        : `Reacted ${reactionInfo.emoji} to "${messageLabel}"`,
    };
  }

  if (lastMessageType === MessageType.Image) {
    return {
      isReaction: false,
      icon: HiOutlinePhoto,
      text: "Photo",
    };
  }
  if (lastMessageType === MessageType.Video) {
    return {
      isReaction: false,
      icon: HiOutlineVideoCamera,
      text: "Video",
    };
  }
  return {
    isReaction: false,
    icon: null,
    text: lastMessageContent,
  };
}
