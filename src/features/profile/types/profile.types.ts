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
export interface UpdateProfileRequest {
  Fname: string;
  Lname: string;
  UserName: string;
  Bio: string;
  Location: string;
  ProfilePicture: string; // Base64 string
  BirthDate: string; // ISO date string
  Gender: number;
  TravelPersonality: number;
  TravelPreferenceIds: number[];
  VisitedCountryIds: number[];
  DreamCountryIds: number[];
}
export type ProfileTab = "Posts" | "My trips" | "Saved";
