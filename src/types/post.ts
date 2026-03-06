export interface Post {
  postId: string;
  savedPostId:   null | undefined;
  id: string;
  authorUsername: string;
  authorProfilePicture: string;
  createdAt: string;
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
  isFollowedByCurrentUser: boolean;
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
export interface LikeUser {
  likeId: string;
  profileId: string;
  userName: string;
  profilePicture: string;
}

export interface PaginatedLikes {
  pageSize: number;
  pageIndex: number;
  records: number;
  pages: number;
  items: LikeUser[];
}

export interface LikesResponse {
  data: PaginatedLikes;
  isSuccess: boolean;
  message: string;
  errorCode: number;
}