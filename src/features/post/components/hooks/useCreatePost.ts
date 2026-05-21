import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { EditMedia } from "../services/createPost";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";
  const BASE_URL = "https://rahhal-api.runasp.net";

  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<EditMedia[]>([]);
  const [user, setUser] = useState<{ name: string; username: string; avatar: string } | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  function getUserFromStorage() {
    const userJS = localStorage.getItem("user");
    if (!userJS) return null;
    return JSON.parse(userJS); 
  }

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = getUserFromStorage();
      if (!storedUser) {
        setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/Profile/GetUserProfile`, {
          params: { ProfileId: storedUser.userId },
          headers: { Authorization: `Bearer ${storedUser.token}`, accept: "application/json" },
        });
        const data = res.data?.data;
        setUser({
          name: data?.fullName || "Unknown User",
          username: data?.userName || "unknown",
          avatar: data?.profilePicture ? (data.profilePicture.startsWith("http") ? data.profilePicture : `${BASE_URL}${data.profilePicture}`) : DEFAULT_AVATAR,
        });
      } catch (err) {
        setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
      }
    };
    fetchUser();
  }, []);

  const { mutate: createPost, isPending: isPosting } = useMutation({
    mutationKey: ["createPost"], 
    mutationFn: async ({ formData }: { formData: FormData; optimisticPost: any }) => {
      const storedUser = getUserFromStorage();
      if (!storedUser) throw new Error("Authentication required");

      return axios.post(`${BASE_URL}/Post/Create`, formData, {
        headers: { 
          Authorization: `Bearer ${storedUser.token}`, 
          accept: "application/json" 
        },
      });
    },
    onMutate: async ({ optimisticPost }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData(["posts"]);

      try {
        queryClient.setQueryData(["posts"], (old: any) => {
          if (!old) return old;
          
          if (Array.isArray(old)) return [optimisticPost, ...old];

          if (old.pages) {
            return {
              ...old,
              pages: old.pages.map((page: any, index: number) => {
                if (index === 0) {
                  if (Array.isArray(page)) return [optimisticPost, ...page];
                  if (page?.data && Array.isArray(page.data)) return { ...page, data: [optimisticPost, ...page.data] };
                  if (page?.items && Array.isArray(page.items)) return { ...page, items: [optimisticPost, ...page.items] };
                }
                return page;
              })
            };
          }
          
          if (old.data && Array.isArray(old.data)) return { ...old, data: [optimisticPost, ...old.data] };

          return old;
        });
      } catch (err) {
        console.error("Safe Cache Update Error:", err);
      }

      setCaption("");
      setMedia([]);
      navigate("/feed");

      return { previousPosts };
    },
    onError: (error, variables, context) => {
      console.error("Create Post Error:", error);
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
      toast.error("Failed to publish your adventure. Please try again.");
    },
    onSuccess: () => {
      toast.success("All set! Your post is out there");
    },
    onSettled: (data, error, variables) => {
      if (variables?.optimisticPost?.media_URLs) {
        variables.optimisticPost.media_URLs.forEach((m: any) => {
          if (m.url?.startsWith("blob:")) URL.revokeObjectURL(m.url);
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleCreatePost = async (onClose?: () => void) => {
    if ((!caption.trim() && media.length === 0) || isCompressing) return;

    const storedUser = getUserFromStorage();
    if (!storedUser) return;

    const formData = new FormData();
    const optimisticMedia: any[] = [];
    
    media.forEach((img) => {
      if (img.file instanceof Blob) {
        formData.append("Files", img.file);
        optimisticMedia.push({ 
          url: img.preview || URL.createObjectURL(img.file), 
          type: img.file.type 
        });
      }
    });
    
    formData.append("UserId", storedUser.userId);
    formData.append("Description", caption);

    const optimisticPost = {
      id: `temp-${Date.now()}`,
      description: caption,
      media_URLs: optimisticMedia,
      mediaUrls: optimisticMedia, 
      mediaUrLs: optimisticMedia,
      userName: user?.username || storedUser.username,
      profileURL: user?.avatar || DEFAULT_AVATAR,
      profileUrl: user?.avatar || DEFAULT_AVATAR,
      isOptimistic: true,
      createdAt: new Date().toISOString(),
      createdDate: new Date().toISOString() 
    };

    if (onClose) onClose();

    createPost({ formData, optimisticPost });
  };

  return { caption, setCaption, media, setMedia, user, isPosting, handleCreatePost, fileRef, isCompressing, setIsCompressing };
}