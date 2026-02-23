export interface Profile {
 fullName: string;
  userName: string;
  location: string;
  bio: string;
  profilePicture: string;
}

export interface ProfileStats {
  trips: number;
  countries: number;
  following: number;
  followers: number;
}

export type ProfileTab = "Posts" | "My trips" | "Saved";
