export interface VibeMedia {
  id: string;
  url: string;
}

export type VibeType = "image" | "video" | "text";

export interface Vibe {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  tripId?: string;
  type: VibeType;
  content: string;
  mediaUrls: string[];

  likes: number;
  commentsCount: number;
  isLiked: boolean;

  createdAt: string;
}

export interface UserVibesGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  vibes: Vibe[];
  lastVibeAt: string;
}
export interface VibeDTO {
  vibeId: string;
  userId: string;
  userName: string;
  profileUrl: string;
  description: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdDate: string;
  mediaUrLs: {
    id: string;
    url: string;
  }[];
}
export interface VibeCommentinput {
  profileId: string;
  postId: string;
  description: string;
  parentCommentId?: string;
}
export interface VibeComment {
  commentId: string;
  profileId: string;

  userName: string;
  profilePicture: string;

  description: string;

  createdDate: string;

  likesCount: number;
  repliesCount: number;

  isLikedByCurrentUser: boolean;
}

export const groupVibesByUser = (vibes: Vibe[]): UserVibesGroup[] => {
  const map = new Map<string, UserVibesGroup>();

  for (const v of vibes) {
    const g = map.get(v.userId);

    if (!g) {
      map.set(v.userId, {
        userId: v.userId,
        userName: v.userName,
        userAvatar: v.userAvatar,
        vibes: [v],
        lastVibeAt: v.createdAt,
      });
    } else {
      g.vibes.push(v);
      if (new Date(v.createdAt) > new Date(g.lastVibeAt)) {
        g.lastVibeAt = v.createdAt;
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastVibeAt).getTime() - new Date(a.lastVibeAt).getTime(),
  );
};
