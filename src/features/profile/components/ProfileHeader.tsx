import { useEffect, useState } from "react";
import EditProfileForm from "./EditProfileForm";
import type { ProfileResponse } from "../types/profile.types";

const ProfileHeader = () => {
const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

 const fetchProfile = async () => {
  try {
    const auth = localStorage.getItem("auth");
    const profileId = auth ? JSON.parse(auth).profileId : null;

    if (!profileId) {
      console.error("No profileId found");
      return;
    }

    const res = await fetch(
      `https://rahhal-api.runasp.net/Profile/GetUserProfile?ProfileId=${profileId}`
    );

    const result = await res.json();

    console.log("Fetched profile data:", result);

    setUserData(result.data);

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
        <img
          src={userData.ProfilePicture}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="font-bold">
            {userData.Fname} {userData.Lname}
          </h2>
          <p className="text-sm text-gray-600">@{userData.fullName}</p>
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