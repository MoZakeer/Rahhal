import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { EditMedia } from "../services/editPost";
import toast from "react-hot-toast";

export function useEditPost(postId: string) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";
  const BASE_URL = "https://rahhal-api.runasp.net";

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<EditMedia[]>([]);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    username: string;
    avatar: string;
  } | null>(null);

  function getUserFromStorage() {
    const userJS = localStorage.getItem("user");
    return userJS ? JSON.parse(userJS) : null;
  }

  const fetchPost = async () => {
    const storedUser = getUserFromStorage();
    if (!storedUser) return;

    const { token } = storedUser;

    try {
      const res = await fetch(`${BASE_URL}/Post/GetById?PostId=${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch post");

      const json = await res.json();
      const data = json.data;
      if (!data) return;

      setCaption(data.description || "");

      const mediaData = data.media_URLs || [];

      setMedia(
        mediaData.map((m: { id: string; url: string }) => ({
          mediaId: m.id,
          file: m.url.startsWith("http")
            ? m.url
            : `${BASE_URL}${m.url}`,
        }))
      );

      setUser({
        name: data.userName || "Unknown User",
        username: data.userName || "unknown",
        avatar: data.profileURL
          ? data.profileURL.startsWith("http")
            ? data.profileURL
            : `${BASE_URL}${data.profileURL}`
          : DEFAULT_AVATAR,
      });
    } catch (err) {
      console.log("Error fetching post", err);

      setUser({
        name: "Unknown User",
        username: "unknown",
        avatar: DEFAULT_AVATAR,
      });
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

 const handleUpdatePost = async () => {
  if (!caption.trim()) return;

  const storedUser = getUserFromStorage();
  if (!storedUser) return;

  const { token } = storedUser;

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("ID", postId);
    formData.append("Description", caption);

    media.forEach((m, index) => {

      formData.append(`Media[${index}].MediaId`, m.mediaId || "");

      if (m.file instanceof File) {
        formData.append(`Media[${index}].File`, m.file);
      }

    });

    const res = await fetch(`${BASE_URL}/Post/Update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update post");

    toast.success("Post updated successfully");

    navigate("/feed");

  } catch (err) {
    console.log("Error updating post ❌", err);
    toast.error("Failed to update post");
  } finally {
    setLoading(false);
  }
};
  return {
    caption,
    setCaption,
    media,
    setMedia,
    loading,
    user,
    handleUpdatePost,
    fileRef,
  };
}
