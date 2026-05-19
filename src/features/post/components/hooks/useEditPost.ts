// useEditPost.ts
import { useState, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Post } from "@/types/post";
import type { EditMedia } from "../services/editPost";

export function useEditPost(post: Post, onClose: () => void) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const BASE_URL = "https://rahhal-api.runasp.net";

  const [caption, setCaption] = useState(post.description || "");
  const [media, setMedia] = useState<EditMedia[]>(() => {
    return (post.mediaUrLs || []).map((m) => ({
      mediaId: m.id || crypto.randomUUID(),
      file: m.url.startsWith("http") ? m.url : `${BASE_URL}${m.url}`,
      isNew: false,
      preview: m.url.startsWith("http") ? m.url : `${BASE_URL}${m.url}`,
    }));
  });

  // Handling both possible cases for avatar URL (profileURL or profileUrl) for backward compatibility
  const avatarPath = post.profileURL || post.profileUrl;

  const user = {
    name: post.userName,
    username: post.userName,
    avatar: avatarPath
      ? (avatarPath.startsWith("http") ? avatarPath : `${BASE_URL}${avatarPath}`)
      : "https://www.gravatar.com/avatar/?d=mp&f=y",
  };

  // Best Practice: using React query Mutation instead of plain fetch for better state management and error handling
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const userJS = localStorage.getItem("user");
      const token = userJS ? JSON.parse(userJS).token : "";

      const res = await fetch(`${BASE_URL}/Post/Update`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to update");
      return res;
    },
    onSuccess: () => {
      toast.success("تم تحديث الرحلة بنجاح!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التحديث");
    }
  });

  const handleUpdatePost = () => {
    if (!caption.trim() && media.length === 0) return;
    const formData = new FormData();
    formData.append("ID", post.id);
    formData.append("Description", caption);

    let i = 0;
    media.forEach((m) => {
      if (!m.isNew && typeof m.file === "string") {
        formData.append(`Media[${i}].mediaId`, m.mediaId);
        formData.append(`Media[${i}].file`, m.file);
      }
      if (m.isNew && m.file instanceof File) {
        formData.append(`Media[${i}].mediaId`, "");
        formData.append(`Media[${i}].file`, m.file);
      }
      i++;
    });

    updateMutation.mutate(formData);
  };

  return {
    caption,
    setCaption,
    media,
    setMedia,
    loading: updateMutation.isPending,
    user,
    handleUpdatePost,
    fileRef,
  };
}