import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../services/userProfileApi";

export const useUserProfile = (profileId: string) => {
  return useQuery({
    queryKey: ["userProfile", profileId],
    queryFn: () => getUserProfile(profileId),
    enabled: !!profileId,
  });
};