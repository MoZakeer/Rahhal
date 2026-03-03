import { create } from "zustand";
import type { ProfileData, ProfileResponse } from "../types/profile.types";

interface ProfileState {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  setProfile: (data: ProfileResponse | ProfileData) => void;
  updateProfile: (data: FormData) => Promise<void>;
  ChangePassword: (data: { oldPassword: string; newPassword: string; confirmNewPassword: string }) => Promise<void>;
  GetUserPosts: (pageNum: number, pageSize: number) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  setProfile: (data) => set({ profile: data instanceof Object && 'data' in data ? (data as ProfileResponse).data : data as ProfileData }),

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });

      const auth = localStorage.getItem("auth");
      const parsedAuth = auth ? JSON.parse(auth) : null;

      const profileId = parsedAuth?.profileId;
      const token = parsedAuth?.token;

      if (!profileId || !token) throw new Error("No profileId or token found");

      const res = await fetch(
        `https://rahhal-api.runasp.net/Profile/GetUserProfile?ProfileId=${profileId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const result = await res.json();

      set({
        profile: result.data,
        loading: false,
      });

    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  updateProfile: async (formData: FormData) => {
    const auth = localStorage.getItem("auth");
    const parsedAuth = auth ? JSON.parse(auth) : null;
    const profileId = parsedAuth?.profileId;
    const token = parsedAuth?.token;

    if (!profileId || !token) return;

    try {
      const res = await fetch(
        `https://rahhal-api.runasp.net/Profile/UpdateProfile/${profileId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await res.json();
      set({ profile: result.data });
    } catch (err) {
      console.error(err);
    }
  },
  ChangePassword: async (data: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    console.log("Changing password with data:", data, localStorage.getItem("token"));
    try {
      const auth = localStorage.getItem("auth");
      const parsedAuth = auth ? JSON.parse(auth) : null;
      const token = parsedAuth?.token;

      if (!token) {
        console.error("No token found");
        return;
      }

      const res = await fetch(
        `https://rahhal-api.runasp.net/Auth/ChangePassword`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      console.log("Password changed:", result);

    } catch (err) {
      console.error(err);
    }
  },
  GetUserPosts: async (pageNum: number, pageSize: number) => {
    const auth = localStorage.getItem("auth");
    const parsedAuth = auth ? JSON.parse(auth) : null;
    const UserId = parsedAuth?.UserId;
    const token = parsedAuth?.token;
    if (!UserId || !token) return;

    try {
      const res = await fetch(
        `https://rahhal-api.runasp.net/Post/GetUserPosts?UserId=${UserId}&PageNumber=${pageNum}&PageSize=${pageSize}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
      console.log("User posts:", result);
    } catch (err) {
      console.error(err);
    }
  }
}));