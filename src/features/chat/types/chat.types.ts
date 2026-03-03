import type { Message } from "./message.types";

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
    messages: PaginatedMessages;
  };
}
