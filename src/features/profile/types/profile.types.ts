export interface ProfileStats {
  trips: number;
  countries: number;
  following: number;
  followers: number;
}
export interface ProfileResponse {
  Id: string;
  Fname: string;
  Lname: string;
  UserName: string;
  Bio: string;
  Location: string;
  ProfilePicture: string; // Base64 string or URL
  BirthDate: string; // ISO string
  Gender: number;
  TravelPersonality: number;
  TravelPreferenceIds: number[];
  VisitedCountryIds: number[];
  DreamCountryIds: number[];
}

export interface UpdateProfileRequest {
  Fname: string;
  Lname: string;
  UserName: string;
  Bio: string;
  Location: string;
  ProfilePicture: string;
  BirthDate: string;
  Gender: number;
  TravelPersonality: number;
  TravelPreferenceIds: number[];
  VisitedCountryIds: number[];
  DreamCountryIds: number[];
}
export type ProfileTab = "Posts" | "My trips" | "Saved";
