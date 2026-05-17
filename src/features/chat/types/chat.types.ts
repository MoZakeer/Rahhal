
export interface PaginatedMessages {
  pageSize: number;
  pageIndex: number;
  pages: number;
  records: number;
  items: Message[];
}
export interface ChatResponse {
  data: {
    conversationId: string;
    isGroup: boolean;
    title: string;
    conversationPictureURL: string;
    otherParticipantProfileId: string;
    lastSeen: string;
    isOnline: boolean;
    messages: PaginatedMessages;
    membersCount: number;
  };
}
export interface Message {
  messageId: string;
  senderProfileId: string;
  senderName: string;
  senderProfilePhoto: string;
  content: string;
  createdDate: string; // ISO Date
  attachments: Attachment[];
  isSeen: boolean;
}
export interface Attachment {
  attachmentId: string;
  fileUrl: string;
}
