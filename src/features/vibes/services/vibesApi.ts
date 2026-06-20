// Vibes API layer

import type {
  Vibe,
  VibeComment,
  VibeCommentinput,
  VibeDTO,
  VibeMedia,
} from "../data/vibesData";

// --------------------
// API BASE
// --------------------

const BASE_URL = "https://rahhal-api.runasp.net";

// --------------------
// HELPERS
// --------------------

const mapVibe = (item: VibeDTO): Vibe => ({
  id: item.vibeId ?? item.vibeId,

  userId: item.userId,
  userName: item.userName,
  userAvatar: item.profileUrl,
  tripId: item.tripId,

  type:
    item.mediaUrLs?.length > 0
      ? item.mediaUrLs[0].url.match(/\.(mp4|webm|ogg)$/i)
        ? "video"
        : "image"
      : "text",

  content: item.description ?? "",
  description: item.description ?? "",

  mediaUrls: item.mediaUrLs?.map((m: VibeMedia) => m.url) ?? [],

  likes: item.likes,
  commentsCount: item.comments,
  isLiked: item.isLiked,

  createdAt: item.createdDate,
});

// --------------------
// READS
// --------------------

export async function fetchFeedVibes(): Promise<Vibe[]> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/Vibes/Feed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch feed vibes");
  }

  const json = await res.json();
  return json.data.items.map(mapVibe);
}

export async function fetchUserVibes(userId: string): Promise<Vibe[]> {
  const res = await fetch(
    `${BASE_URL}/Vibes/GetByUserId?UserId=${userId}&VibesOnly=true`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user vibes");
  }

  const json = await res.json();

  return json.data.items.map(mapVibe);
}

export async function fetchTripVibesByTripId(tripId: string): Promise<Vibe[]> {
  const response = await fetch(
    `https://rahhal-api.runasp.net/Vibes/GetByTripId?TripId=${tripId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch trip vibes");
  }

  return data.data.items.map((item: any) => ({
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    userAvatar: item.profileUrl,
    description: item.description,
    createdAt: item.createdDate,
    mediaUrls: item.mediaUrLs?.map((m: any) => m.url) || [],
    reactions: {
      count: item.likes,
      userReacted: item.isLiked,
    },
    commentsCount: item.comments,
  }));
}

// --------------------
// CREATE
// --------------------

export interface CreateVibeInput {
  tripId: string;
  description: string;
  files?: File[];
}
export async function createVibe(input: CreateVibeInput): Promise<any> {
  const formData = new FormData();

  if (input.files?.length) {
    input.files.forEach((file) => {
      formData.append("Files", file);
    });
  }

  const params = new URLSearchParams({
    Description: input.description,
    TripId: input.tripId,
  });

  const response = await fetch(
    `https://rahhal-api.runasp.net/Vibes/Create?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create vibe");
  }

  return data;
}

// --------------------
// UPDATE
// --------------------

// --------------------
// UPDATE
// --------------------

// نحدث الـ Interface ليتطابق تماماً مع البيانات المرسلة من الـ Component والـ Swagger
export interface UpdateVibeInput {
  id: string;
  description: string;
  files?: File[];
}

export async function updateVibe(input: UpdateVibeInput): Promise<any> {
  const formData = new FormData();

  // 1. إضافة الـ ID والـ Description للـ FormData
  formData.append("ID", input.id);
  formData.append("Description", input.description);

  // 2. إضافة الملفات المرفوعة الجديدة إلى حقل "Media" كما تطلب الـ Endpoint
  if (input.files?.length) {
    input.files.forEach((file) => {
      formData.append("Media", file);
    });
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/Vibes/Update`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update vibe");
  }

  return data;
}
// --------------------
// DELETE
// --------------------

export async function deleteVibe(postId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/Vibes/Delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
    },
    body: JSON.stringify({
      postId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete vibe");
  }
}

// --------------------
// PERMISSIONS
// --------------------

export interface TripTraveler {
  profileId: string;
  userName?: string;
  imageUrl?: string;
}

export interface TripLite {
  ownerId?: string;
  travelers?: TripTraveler[];
}

export const canPostVibe = (trip: TripLite | null, userId?: string | null) => {
  if (!userId || !trip) return false;

  const allowedIds = trip.travelers?.map((t) => t.profileId) ?? [];

  if (trip.ownerId === userId) return true;

  return allowedIds.includes(userId);
};

export const canEditVibe = (vibe: Vibe, userId?: string | null) =>
  Boolean(userId && vibe.userId === userId);

export const canDeleteVibe = (vibe: Vibe, userId?: string | null) =>
  Boolean(userId && vibe.userId === userId);

export async function addComment(input: VibeCommentinput): Promise<void> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/Comment/Create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      profileId: input.profileId,
      postId: input.postId,
      parentCommentId: input.parentCommentId ?? null,
      description: input.description,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to add comment");
  }
}
// Add this to your vibesApi.ts
export const deleteComment = async (commentId: string): Promise<void> => {
  await fetch(`${BASE_URL}/Vibes/DeleteComment`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },

    body: JSON.stringify({ commentId }),
  });
};
export const addLikeToComment = async (
  profileId: string,
  commentId: string,
): Promise<void> => {
  await fetch(`${BASE_URL}/Vibes/AddLikeToComment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ profileId, commentId }),
  });
};
export const updateComment = async (
  commentId: string,
  description: string,
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/Comment/Update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      commentId,
      description,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Update comment failed:", errorText);

    throw new Error("Failed to update comment");
  }
};
export async function fetchVibeComments(
  postId: string,
): Promise<VibeComment[]> {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${BASE_URL}/Vibes/AllCommentsToVibe?PostId=${postId}&SortByLastAdded=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch comments");
  }

  const json = await res.json();

  return json.data.items;
}
// --------------------
// LIKE VIBE
// --------------------

export async function toggleReaction(postId: string): Promise<void> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/Vibes/AddLikeToVibe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      postId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to like vibe");
  }
}
