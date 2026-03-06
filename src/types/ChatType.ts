export type ChatType = {
  conversationId: string;
  isGroup: boolean;
  lastMessageContent: string;
  lastMessageDate: string;
  unreadMessagesCount: number;
  groupTitle: string;
  conversationPicture: string;
  otherUserName: string;
  otherUserProfilePicture: string;
  lastMessageType: number;
};
