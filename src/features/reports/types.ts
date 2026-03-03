export interface CommentReport {
  commentId: string;
  commentContent: string;
  commentAuthorId: string;
  commentAuthorUserName: string;
  commentAuthorPicture: string;
  countReports: number;
}
export interface UserReport {
  reportedUserId: string;
  reportedUserName: string;
  reportedUserPicture: string ;
  countReports: number;
}

export interface PaginatedResponse<T> {
  pageSize: number;
  pageIndex: number;
  records: number;
  pages: number;
  items: T[];
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: number;
}
export type ReportType = "comments" | "posts" | "users";
export type ReportEntityType = "post" | "comment" | "user";
export interface PostReport {
  id: string;
  userId: string;
  userName: string;
  profileUrl: string ;
  description: string;
  likes: number;
  comments: number;
  createdDate: string;
  countReports: number;


  mediaUrLs?: {
    id: string;
    url: string;
  }[];
}