import { useState } from "react";
import { useParams } from "react-router-dom";

import ProfileHeader from "../../features/profile/components/ProfileHeader";
import ProfileStats from "../../features/profile/components/ProfileStats";
import ProfileTabs from "../../features/profile/components/ProfileTabs";
import ProfilePosts from "../../features/profile/components/ProfilePosts";
import SavedPosts from "../../features/profile/components/SavedPosts";

import type { ProfileTab } from "../../features/profile/types/profile.types";

const ProfilePage: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();

  const auth = localStorage.getItem("auth");
  const parsedAuth = auth ? JSON.parse(auth) : null;
  const myProfileId = parsedAuth?.profileId || "";

  const isMyProfile = myProfileId === profileId;

  const [activeTab, setActiveTab] = useState<ProfileTab>("Posts");
if (!profileId) return <div>Profile not found</div>;
  return (
    <div className="mx-auto w-full min-h-screen bg-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
        <ProfileHeader profileId={profileId} isMyProfile={isMyProfile} />
        <ProfileStats profileId={profileId} />

        <ProfileTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMyProfile={isMyProfile}
        />

        <div className="flex-1 space-y-6">
          {activeTab === "Posts" && <ProfilePosts profileId={profileId} />}
          {activeTab === "Saved" && isMyProfile && <SavedPosts profileId={profileId} isMyProfile={isMyProfile} />}
          {activeTab === "My trips" && (
            <div className="py-10 text-center text-gray-500">
              My Trips Coming Soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;