export interface Post {
  id: string;
  userId: string;
  userName: string;
  profileUrl: string;
  description: string;
  mediaUrLs: PostMediaItem[];
createdDate?: string;
  likes?: number;
  comments?: number;
  isLiked: boolean;
  isSaved: boolean;
}
export interface PostMediaItem {
  id: string;
  url: string;
}
export interface PostsResponse {
  data: {
    pageSize: number;
    pageIndex: number;
    records: number;
    pages: number;
    items: Post[];
  };
  isSuccess: boolean;
  message: string;
  errorCode: number;
}