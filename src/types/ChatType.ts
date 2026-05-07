export type ChatType = {
  conversationId: string;
  isGroup: boolean;
  lastMessageContent: string;
  lastMessageDate: string;
  lastMessageSender: string;
  unreadMessagesCount: number;
  groupTitle: string;
  conversationPicture: string;
  otherUserName: string;
  otherUserProfilePicture: string;
  lastMessageType: number;
  isLastMessageFullySeen: boolean;
  messageType:number;
};
