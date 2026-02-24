import type { PostsResponse } from "../../../../types/post";

const BASE_URL = "https://rahhal-api.runasp.net";

function getToken() {
  const userJS = localStorage.getItem("user");
  if (!userJS) return "";
  const user = JSON.parse(userJS);

  return user?.token;
}
export async function getAllPosts(): Promise<PostsResponse> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/Post/GetAll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  console.log("TOKEN:", token);

  return res.json();
}
export function normalizeMediaUrl(url: string) {
  if (!url) return "";

  // already a full url
  if (url.startsWith("http")) return url;

  // if backend returns /uploads/...
  if (url.startsWith("/uploads")) return `${BASE_URL}${url}`;

  // handle windows path OR any path
  const fileName = url.split("\\").pop()?.split("/").pop();

  const finalUrl = `${BASE_URL}/uploads/${fileName}`;
  return finalUrl;
}
export async function deletePost(postId: string) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}/Post/Delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to delete post");

  try {
    return await res.json();
  } catch {
    return { isSuccess: res.ok };
  }
}
export async function savePost(postId: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/Post/SavePost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to save post");

  try {
    return await res.json();
    
  } catch {
    return { isSuccess: res.ok };
  }
}

export async function likePost(postId: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/Like/AddToPost`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ postId }),
  });

  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

