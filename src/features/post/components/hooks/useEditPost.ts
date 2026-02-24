import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { EditMedia } from "../services/editPost";

export function useEditPost(postId: string) {
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<EditMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; username: string; avatar: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const BASE_URL = "https://rahhal-api.runasp.net";

  function getUserFromStorage() {
    const userJS = localStorage.getItem("user");
    return userJS ? JSON.parse(userJS) : null;
  }

  // ================= Fetch User =================
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = getUserFromStorage();
      if (!storedUser) {
        setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
        return;
      }

      const { token, userId } = storedUser;

      try {
        const res = await fetch(`${BASE_URL}/Profile/GetUserProfile?ProfileId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const json = await res.json();
        const data = json.data;

        if (!data) {
          setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
          return;
        }

        setUser({
          name: data.fullName || "Unknown User",
          username: data.userName || "unknown",
          avatar: data.profilePicture || DEFAULT_AVATAR,
        });
      } catch {
        setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
      }
    };

    fetchUser();
  }, []);

  // ================= Fetch Post =================
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

      const mediaData = data.mediaUrLs || data.media_URLs || [];
      setMedia(
        mediaData.map((m: { id: string; url: string }) => ({
          mediaId: m.id,
          file: m.url.startsWith("http") ? m.url : `${BASE_URL}${m.url}`,
        }))
      );
    } catch (err) {
      console.log("Error fetching post", err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // ================= Update Post =================
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
        if (m.file instanceof File) {
          formData.append(`Media[${index}].File`, m.file);
          formData.append(`Media[${index}].MediaId`, ""); // جديد
        } else {
          formData.append(`Media[${index}].MediaId`, m.mediaId);
        }
      });

      const res = await fetch(`${BASE_URL}/Post/Update`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update post");

      console.log("Post updated successfully ✅");
      await fetchPost();
      navigate("/feed");
    } catch (err) {
      console.log("Error updating post ❌", err);
    } finally {
      setLoading(false);
    }
  };

  return { caption, setCaption, media, setMedia, loading, user, handleUpdatePost, fileRef };
}
