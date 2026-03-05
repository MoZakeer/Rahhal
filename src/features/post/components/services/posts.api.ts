import type { PostsResponse } from "../../../../types/post";

const BASE_URL = "https://rahhal-api.runasp.net";

function getToken() {
  return localStorage.getItem("token");
}

export async function getPosts(): Promise<PostsResponse> {
  const res = await fetch(`${BASE_URL}/Post/GetAll`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch posts");

  return res.json();
}

export async function likePost(postId: string) {
  const res = await fetch(`${BASE_URL}/Like/AddToPost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to like post");

  return res.json();
}

export async function savePost(postId: string) {
  const res = await fetch(`${BASE_URL}/Post/SavePost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to save post");

  return res.json();
}

export async function deletePost(postId: string) {
  const res = await fetch(`${BASE_URL}/Post/Delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to delete post");

  return res.json();
}
export function normalizeMediaUrl(url?: string) {
  if (!url) return "";

  // already full url
  if (url.startsWith("http")) return url;

  // backend returns /uploads/file.jpg
  if (url.startsWith("/uploads")) {
    return `${BASE_URL}${url}`;
  }

  // extract filename from windows or linux path
  const fileName = url.split("\\").pop()?.split("/").pop();

  return `${BASE_URL}/uploads/${fileName}`;
}
export async function followUser(userId: string) {
  const res = await fetch(`${BASE_URL}/Followers/Follow`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      followingProfileId: userId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to follow user");
  }

  return res.json();
}