import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { EditMedia } from "../services/createPost";
import toast from "react-hot-toast";
export function useCreatePost() {
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/?d=mp&f=y";

  const BASE_URL = "https://rahhal-api.runasp.net";
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<EditMedia[]>([]);
  const [user, setUser] = useState<{ name: string; username: string; avatar: string } | null>(null);
  const [isPosting, setIsPosting] = useState(false);
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

      const { token, userId } = storedUser;

      try {
        const res = await axios.get(`${BASE_URL}/Profile/GetUserProfile`, {
          params: { ProfileId: userId },
          headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
        });

        const data = res.data?.data;
        if (!data) {
          console.log("No profile data returned");
          setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
          return;
        }

        setUser({
          name: data.fullName || "Unknown User",
          username: data.userName || "unknown",
          avatar: data.profilePicture ? (data.profilePicture.startsWith("http") ? data.profilePicture : `${BASE_URL}${data.profilePicture}`) : DEFAULT_AVATAR,
        });
      } catch (err) {
        console.log("Error fetching user", err);
        setUser({ name: "Unknown User", username: "unknown", avatar: DEFAULT_AVATAR });
      }
    };

    fetchUser();
  }, []);

  const handleCreatePost = async () => {
    if (!caption && media.length === 0) return;

    setIsPosting(true);

    const storedUser = getUserFromStorage();
    if (!storedUser) {
      console.log("No user/token found");
      setIsPosting(false);
      return;
    }

    const { token, userId } = storedUser;

    const formData = new FormData();
    media.forEach((img) => {
      if (img.file instanceof File) {
        formData.append("Files", img.file);
      }
    });
    formData.append("UserId", userId);
    formData.append("Description", caption);

    try {
      const res = await axios.post("https://rahhal-api.runasp.net/Post/Create", formData, {
        headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      });
      console.log("Post created", res.data);
      setCaption("");
      setMedia([]);
      navigate("/feed");
 toast("All set! Your post is out there", {
            duration: 2000,
  style: {
    border: "1px solid #gray", 
    padding: "5px",
    color: "gray",
    background: "#FFFfff",
  },
  iconTheme: {
    primary: "#06b6d4",
    secondary: "#FFFfff",
  },
});    } catch (error) {
      console.log("ERROR", error);
    } finally {
      setIsPosting(false);
    }
  };

  return { caption, setCaption, media, setMedia, user, isPosting, handleCreatePost, fileRef };
}
