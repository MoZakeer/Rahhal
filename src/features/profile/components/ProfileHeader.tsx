import { useEffect, useState } from "react";
import EditProfileForm from "./EditProfileForm";
import type { ProfileResponse } from "../types/profile.types";

const ProfileHeader = () => {
  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const id = localStorage.getItem("profileId") || "";
      const res = await fetch(`https://rahhal-api.runasp.net/Profile/GetUserProfile?ProfileId=${id}`);
      const data = await res.json();
      setUserData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
      <div className="flex items-center gap-4">
        <img src={userData.ProfilePicture} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h2 className="font-bold">{userData.Fname} {userData.Lname}</h2>
          <p className="text-sm text-gray-600">@{userData.UserName}</p>
        </div>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Edit Profile
      </button>

      {isModalOpen && (
        <EditProfileForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userData={userData}
          onSuccess={fetchProfile} 
        />
      )}
    </div>
  );
};

export default ProfileHeader;