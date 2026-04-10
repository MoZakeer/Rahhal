import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { EditMedia } from "../services/editPost";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useEditPost(postId: string) {
  const queryClient = useQueryClient();
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
          mediaId: m.id || crypto.randomUUID(),
          file: m.url.startsWith("http")
            ? m.url
            : `${BASE_URL}${m.url}`,
          isNew: false, 
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
      toast.error("Failed to load post");

      setUser({
        name: "Unknown User",
        username: "unknown",
        avatar: DEFAULT_AVATAR,
      });
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  const handleUpdatePost = async () => {
  if (!caption.trim() && media.length === 0) return;

  const storedUser = getUserFromStorage();
  if (!storedUser) return;

  const { token } = storedUser;

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("ID", postId);
    formData.append("Description", caption);

    
   media.forEach((m, index) => {

  if (!m.isNew && typeof m.file === "string") {
    formData.append(`Media[${index}].mediaId`, m.mediaId);
    formData.append(`Media[${index}].file`, m.file);
  }

  
  if (m.isNew && m.file instanceof File) {
    formData.append(`Media[${index}].file`, m.file);
  }
});

    const res = await fetch(`${BASE_URL}/Post/Update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Update failed:", text);
      throw new Error("Failed to update post");
    }

    toast.success("Post updated successfully");

    queryClient.invalidateQueries({ queryKey: ["posts"] });
    navigate("/feed");
  } catch (err) {
    console.error(err);
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
