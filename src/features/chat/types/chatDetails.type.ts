export type Participant = {
  profileId: string;
  userName: string;
  profilePicture: string | null;
  isAdmin: boolean;
  description: string;
};

export type ChatDetails = {
  conversationId: string;
  isGroup: boolean;
  createdDate: string;
  title: string;
  description: string;
  conversationPictureURL: string | null;
  isCurrentUserAdmin: boolean;
  participants: Participant[];
  otherProfileId: string | null;
  membersCount: number;
};

export type ChatDetailsResponse = {
  data: ChatDetails;
  isSuccess: boolean;
  message: string;
  errorCode: number;
};
