import { useState, useEffect } from "react";
import EditProfileForm from "./EditProfileForm";
import { useProfileStore } from "../store/profile.store";
import Image from "../../../../public/avater.png"
const ProfileHeader = () => {
  const { profile, fetchProfile, loading } = useProfileStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  if (loading || !profile) return <div>Loading...</div>;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between p-6 bg-white rounded-xl shadow-md">
      <div className="flex items-center gap-5">
        <img
          src={profile.profilePicture || Image}
          className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{profile.fullName}</h2>
          <p className="text-gray-500 text-sm">@{profile.userName}</p>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-4 sm:mt-0 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Edit Profile
      </button>

      {isModalOpen && (
        <EditProfileForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfileHeader;