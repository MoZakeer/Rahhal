export interface CommentReport {
  commentId: string;
  commentContent: string;
  commentAuthorId: string;
  commentAuthorUserName: string;
  commentAuthorPicture: string;
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
export interface PostReport {
  id: string;
  userId: string;
  userName: string;
  profileUrl?: string | null;
  description: string;
  likes: number;
  comments: number;
  createdDate: string;

  mediaUrLs?: {
    id: string;
    url: string;
  }[];
}