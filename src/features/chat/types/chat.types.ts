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

export interface Attachment {
  attachmentId: string;
  fileUrl: string;
}

export interface ParentMessageInfo {
  messageId: string;
  senderName: string;
  content: string;
  type: number;
  attachmentUrls: Attachment[];
}

export interface Message {
  messageId: string;
  senderProfileId: string;
  senderName: string;
  senderProfilePhoto: string;

  content: string;

  createdDate: string;

  attachments: Attachment[];

  isSeen: boolean;

  parentMessageInfo?: ParentMessageInfo | null;
}
