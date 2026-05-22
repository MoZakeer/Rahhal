import { useState, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import type { Post } from "@/types/post";
import type { EditMedia } from "../services/editPost";

export function useEditPost(post: Post, onClose: () => void) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const BASE_URL = "https://rahhal-api.runasp.net";

  const [caption, setCaption] = useState(post.description || "");
  const [isCompressing, setIsCompressing] = useState(false);

  const [media, setMedia] = useState<EditMedia[]>(() => {
    const existingImages =
      (post as any).media_URLs ||
      (post as any).mediaUrLs ||
      (post as any).mediaUrls ||
      [];
    return existingImages.map((m: any) => ({
      mediaId: m.id || crypto.randomUUID(),
      file: m.url?.startsWith("http") ? m.url : `${BASE_URL}${m.url}`,
      isNew: false,
      preview: m.url?.startsWith("http") ? m.url : `${BASE_URL}${m.url}`,
      type: m.type || "",
    }));
  });

  const avatarPath = (post as any).profileURL || post.profileUrl;
  const user = {
    name: post.userName,
    username: post.userName,
    avatar: avatarPath
      ? avatarPath.startsWith("http")
        ? avatarPath
        : `${BASE_URL}${avatarPath}`
      : "https://www.gravatar.com/avatar/?d=mp&f=y",
  };

  const updateMutation = useMutation({
    mutationKey: ["editPost"],
    mutationFn: async ({
      formData,
    }: {
      formData: FormData;
      updatedOptimisticPost: any;
    }) => {
      const userJS = localStorage.getItem("user");
      const token = userJS ? JSON.parse(userJS).token : "";

      const res = await axios.patch(`${BASE_URL}/Post/Update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });
      return res.data;
    },
    onMutate: async ({ updatedOptimisticPost }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      await queryClient.cancelQueries({ queryKey: ["PostDetails", post.id] });

      const previousPosts = queryClient.getQueryData(["posts"]);
      const previousPostDetails = queryClient.getQueryData([
        "PostDetails",
        post.id,
      ]);

      try {
        queryClient.setQueryData(["posts"], (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.map((p) =>
              p.id === post.id
                ? { ...p, ...updatedOptimisticPost, isOptimistic: true }
                : p,
            );
          }

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any) => {
                if (Array.isArray(page))
                  return page.map((p) =>
                    p.id === post.id
                      ? { ...p, ...updatedOptimisticPost, isOptimistic: true }
                      : p,
                  );
                if (page?.data && Array.isArray(page.data))
                  return {
                    ...page,
                    data: page.data.map((p: any) =>
                      p.id === post.id
                        ? { ...p, ...updatedOptimisticPost, isOptimistic: true }
                        : p,
                    ),
                  };
                if (page?.items && Array.isArray(page.items))
                  return {
                    ...page,
                    items: page.items.map((p: any) =>
                      p.id === post.id
                        ? { ...p, ...updatedOptimisticPost, isOptimistic: true }
                        : p,
                    ),
                  };
                return page;
              }),
            };
          }

          return old;
        });

        queryClient.setQueryData(["PostDetails", post.id], (old: any) => {
          if (!old) return old;
          return { ...old, ...updatedOptimisticPost, isOptimistic: true };
        });
      } catch (err) {
        console.error("Safe Update Cache Error:", err);
      }

      return { previousPosts, previousPostDetails };
    },
    onError: (error, _, context) => {
      console.error("Update failed:", error);
      if (context?.previousPosts)
        queryClient.setQueryData(["posts"], context.previousPosts);
      if (context?.previousPostDetails)
        queryClient.setQueryData(
          ["PostDetails", post.id],
          context.previousPostDetails,
        );
      toast.error("حدث خطأ أثناء التحديث");
    },
    onSuccess: () => {
      toast.success("تم تحديث الرحلة بنجاح!");
    },
    onSettled: (_data, _error, variables) => {
      variables.updatedOptimisticPost.media_URLs.forEach((m: any) => {
        if (m.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["PostDetails", post.id] });
    },
  });

  const handleUpdatePost = () => {
    if ((!caption.trim() && media.length === 0) || isCompressing) return;

    const formData = new FormData();
    formData.append("ID", post.id);
    formData.append("Description", caption);

    const optimisticMediaUrls: any[] = [];
    let i = 0;

    media.forEach((m) => {
      if (!m.isNew && typeof m.file === "string") {
        formData.append(`Media[${i}].mediaId`, m.mediaId);
        formData.append(`Media[${i}].file`, m.file);

        optimisticMediaUrls.push({ id: m.mediaId, url: m.file, type: m?.type });
      } else if (m.isNew && m.file instanceof Blob) {
        formData.append(`Media[${i}].mediaId`, "");
        formData.append(`Media[${i}].file`, m.file);

        optimisticMediaUrls.push({
          id: `temp-${i}`,
          url: m.preview || URL.createObjectURL(m.file),
          type: m.file.type,
        });
      }
      i++;
    });

    const updatedOptimisticPost = {
      description: caption,
      media_URLs: optimisticMediaUrls,
      mediaUrls: optimisticMediaUrls,
      mediaUrLs: optimisticMediaUrls,
    };

    updateMutation.mutate({ formData, updatedOptimisticPost });

    onClose();
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
    isCompressing,
    setIsCompressing,
  };
}
