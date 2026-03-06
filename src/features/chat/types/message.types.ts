import type { Attachment } from "./attachment.types";

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
