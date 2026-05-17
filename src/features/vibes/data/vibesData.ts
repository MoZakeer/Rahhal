// Mock data for the Vibes feature (Stories-like for trips).
// Replace with real backend integration later.

export type VibeType = "image" | "video" | "text" | "mixed";

export interface VibeReaction {
  emoji: string; // e.g. "❤️"
  count: number;
  userReacted: boolean;
}

export interface VibeComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string; // ISO
}

export interface Vibe {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: VibeType;
  content?: string;
  mediaUrls: string[]; // up to 4 images OR 1 video
  reactions: VibeReaction;
  latestComment?: VibeComment;
  commentsCount: number;
  comments: VibeComment[];
  createdAt: string; // ISO
}

export interface UserVibesGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  vibes: Vibe[]; // sorted oldest -> newest within group
  lastVibeAt: string;
}

// ----- Sample users -----
const u = {
  layla: {
    userId: "user-1",
    userName: "Layla Hassan",
    userAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
  },
  omar: {
    userId: "user-2",
    userName: "Omar Khaled",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
  },
  sara: {
    userId: "user-3",
    userName: "Sara Adel",
    userAvatar:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&crop=faces",
  },
  yusuf: {
    userId: "user-4",
    userName: "Yusuf Tarek",
    userAvatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces",
  },
};

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

export const mockVibes: Vibe[] = [
  // Trip 1
  {
    id: "v1",
    tripId: "1",
    ...u.layla,
    type: "mixed",
    content: "Sunset over the Aegean — words can't capture this 🌅",
    mediaUrls: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=1600&fit=crop",
      "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=900&h=1600&fit=crop",
    ],
    reactions: { emoji: "❤️", count: 24, userReacted: false },
    commentsCount: 3,
    comments: [
      {
        id: "c1",
        ...u.omar,
        text: "Stunning! Which beach is that?",
        createdAt: hoursAgo(1),
      },
      {
        id: "c2",
        ...u.sara,
        text: "Adding this to my bucket list.",
        createdAt: hoursAgo(0.5),
      },
    ],
    latestComment: {
      id: "c2",
      ...u.sara,
      text: "Adding this to my bucket list.",
      createdAt: hoursAgo(0.5),
    },
    createdAt: hoursAgo(2),
  },
  {
    id: "v2",
    tripId: "1",
    ...u.layla,
    type: "image",
    mediaUrls: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&h=1600&fit=crop",
    ],
    reactions: { emoji: "❤️", count: 12, userReacted: true },
    commentsCount: 0,
    comments: [],
    createdAt: hoursAgo(1),
  },
  {
    id: "v3",
    tripId: "1",
    ...u.omar,
    type: "text",
    content: "Day 2 — the food in Santorini is unreal. We tried 4 tavernas in one night 🍷",
    mediaUrls: [],
    reactions: { emoji: "❤️", count: 8, userReacted: false },
    commentsCount: 1,
    comments: [
      {
        id: "c3",
        ...u.layla,
        text: "Best decision we made!",
        createdAt: hoursAgo(3),
      },
    ],
    latestComment: {
      id: "c3",
      ...u.layla,
      text: "Best decision we made!",
      createdAt: hoursAgo(3),
    },
    createdAt: hoursAgo(4),
  },
  {
    id: "v4",
    tripId: "1",
    ...u.sara,
    type: "image",
    content: "Caldera vibes 🤍",
    mediaUrls: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900&h=1600&fit=crop",
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=900&h=1600&fit=crop",
      "https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?w=900&h=1600&fit=crop",
    ],
    reactions: { emoji: "❤️", count: 17, userReacted: false },
    commentsCount: 0,
    comments: [],
    createdAt: hoursAgo(0.3),
  },
  // Trip 2
  {
    id: "v5",
    tripId: "2",
    ...u.yusuf,
    type: "image",
    content: "Tokyo by night 🗼",
    mediaUrls: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=900&h=1600&fit=crop",
    ],
    reactions: { emoji: "❤️", count: 31, userReacted: false },
    commentsCount: 2,
    comments: [
      {
        id: "c4",
        ...u.layla,
        text: "Take me back!",
        createdAt: hoursAgo(5),
      },
    ],
    latestComment: {
      id: "c4",
      ...u.layla,
      text: "Take me back!",
      createdAt: hoursAgo(5),
    },
    createdAt: hoursAgo(6),
  },
];

// ----- Helpers -----
export const getVibesByTrip = (tripId: string): Vibe[] =>
  mockVibes.filter((v) => v.tripId === tripId);

export const getVibesByUser = (userId: string): Vibe[] =>
  mockVibes.filter((v) => v.userId === userId);

export const getAllVibes = (): Vibe[] => [...mockVibes];

/**
 * Group vibes by user, sorted by most recent vibe (newest user first).
 * Vibes inside each group are sorted oldest -> newest for sequential viewing.
 */
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
      if (new Date(v.createdAt) > new Date(g.lastVibeAt)) g.lastVibeAt = v.createdAt;
    }
  }
  const groups = Array.from(map.values());
  groups.forEach((g) =>
    g.vibes.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  );
  groups.sort(
    (a, b) => new Date(b.lastVibeAt).getTime() - new Date(a.lastVibeAt).getTime()
  );
  return groups;
};
